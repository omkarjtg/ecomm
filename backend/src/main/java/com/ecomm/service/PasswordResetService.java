package com.ecomm.service;

import com.ecomm.dto.PasswordResetResponse;
import com.ecomm.model.PasswordResetToken;
import com.ecomm.model.User;
import com.ecomm.repo.PasswordResetTokenRepository;
import com.ecomm.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRY_MINUTES = 15;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public PasswordResetResponse initiatePasswordReset(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("Password reset requested for non-existent email: {}", email);
            return new PasswordResetResponse(false, null, null);
        }


        // Delete existing tokens in a separate operation with flush
        tokenRepository.deleteByUserId(user.getId());
        tokenRepository.flush(); // Ensure deletion completes

        // Generate a new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

        // Clean up old tokens
        tokenRepository.deleteByUser(user);

        // Save new token
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiry);
        tokenRepository.save(resetToken);
        logger.info("Created password reset token {} for user {}", token, user.getEmail());

        // Send email with clickable link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetLink(user.getEmail(), user.getUsername(), resetLink);
        logger.debug("Sent reset email to {} with token {}", user.getEmail(), token);

        return new PasswordResetResponse(true, token, user.getUsername());
    }

    @Transactional
    public void completePasswordReset(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            logger.error("Password reset attempted with empty token");
            throw new IllegalArgumentException("Token cannot be empty");
        }
        String trimmedToken = token.trim(); // New variable for trimmed value

        PasswordResetToken resetToken = tokenRepository.findByToken(trimmedToken)
                .orElseThrow(() -> {
                    logger.error("Invalid password reset token: {}", trimmedToken); // Use trimmedToken
                    return new RuntimeException("Invalid token");
                });

        if (resetToken.isExpired()) {
            logger.warn("Attempted reset with expired token: {}", trimmedToken);
            throw new RuntimeException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
        logger.info("Password reset completed for user: {}", user.getEmail());
    }
}
