package com.ecomm.service;

import com.ecomm.dto.PasswordResetResponse;
import com.ecomm.model.PasswordResetToken;
import com.ecomm.model.User;
import com.ecomm.repo.PasswordResetTokenRepository;
import com.ecomm.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepo repo, PasswordEncoder passwordEncoder) {
        this.userRepo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    private PasswordResetTokenRepository tokenRepo;

    @Transactional
    public User saveUser(User user) {
        logger.info("Attempting to save user: {}", user.getUsername());

        if (user == null) {
            logger.error("User is null");
            throw new IllegalArgumentException("User cannot be null");
        }
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            logger.error("Username is null or empty");
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            logger.error("Email is null or empty");
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            logger.error("Password is null or empty");
            throw new IllegalArgumentException("Password cannot be null or empty");
        }

        try {
            // Hash the password before saving
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            User savedUser = userRepo.save(user);
            logger.info("User saved successfully: {}", savedUser.getUsername());
            return savedUser;
        } catch (DataIntegrityViolationException e) {
            logger.error("Failed to save user due to constraint violation: {}", e.getMessage());
            throw new IllegalArgumentException("Username or email is already taken", e);
        } catch (Exception e) {
            logger.error("Failed to save user: {}", e.getMessage());
            throw new RuntimeException("Failed to save user", e);
        }
    }

    public User findByUsername(String username) {
        logger.info("Finding user by username: {}", username);
        User user = userRepo.findByUsername(username);
        if (user != null) {
            logger.info("User found: {}", username);
            return user;
        } else {
            logger.warn("User not found with username: {}", username);
            return null;
        }
    }

    public User findByEmail(String email) {
        logger.info("Finding user by email: {}", email);
        User user = userRepo.findByEmail(email);
        if (user != null) {
            logger.info("User found: {}", email);
            return user;
        } else {
            logger.warn("User not found with email: {}", email);
            return null;
        }
    }

    public User findByUsernameOrEmail(String identifier) {
        logger.info("Finding user by identifier (username or email): {}", identifier);
        User user = userRepo.findByUsername(identifier);
        if (user != null) {
            logger.info("User found by username: {}", identifier);
            return user;
        }

        user = userRepo.findByEmail(identifier);
        if (user != null) {
            logger.info("User found by email: {}", identifier);
            return user;
        }

        logger.warn("User not found with identifier: {}", identifier);
        return null;
    }

}