package com.ecomm.controller;

import com.ecomm.dto.PasswordResetResponse;
import com.ecomm.service.EmailService;
import com.ecomm.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Collections;
import java.util.Map;

@RestController
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);
    private static final String RESET_URL_BASE = "http://localhost:5173/reset-password?token=";

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private EmailService emailService;

    // DTO for forgot password request
    public record ForgotPasswordRequest(String email) {}

    // DTO for reset password request
    public record ResetPasswordRequest(String newPassword) {}

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        try {
            String email = request.email() != null ? request.email().trim().toLowerCase() : null;
            if (email == null || email.isEmpty()) {
                logger.warn("Forgot password request failed: Email is empty");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("message", "Email is required"));
            }

            logger.info("Processing forgot password request for email: {}", email);
            PasswordResetResponse response = passwordResetService.initiatePasswordReset(email);

            // Even if user doesn't exist, return a vague success message for security
            if (response.success()) {
                String resetLink = RESET_URL_BASE + response.token();
                emailService.sendPasswordResetLink(email, response.username(), resetLink);
                logger.info("Password reset link sent to: {}", email);
            } else {
                logger.info("No user found for email: {}, still returning success for security", email);
            }

            return ResponseEntity.ok()
                    .body(Collections.singletonMap("message",
                            "If this email exists, a reset link has been sent"));
        } catch (Exception e) {
            logger.error("Error processing forgot password request for email: {}", request.email(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Error processing request"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestParam("token") String token,
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            if (token == null || token.trim().isEmpty()) {
                logger.warn("Password reset failed: Token is empty");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("message", "Token is required"));
            }
            String trimmedToken = token.trim();

            if (request.newPassword() == null || request.newPassword().trim().isEmpty()) {
                logger.warn("Password reset failed: New password is empty");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("message", "New password is required"));
            }

            logger.info("Processing password reset for token: {}", trimmedToken);
            passwordResetService.completePasswordReset(trimmedToken, request.newPassword());

            logger.info("Password reset successful for token: {}", trimmedToken);
            return ResponseEntity.ok()
                    .body(Collections.singletonMap("message", "Password reset successful"));
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        } catch (RuntimeException e) {
            logger.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error resetting password for token: {}", token, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Error processing request"));
        }
    }
}