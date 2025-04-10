package com.ecomm.service;

import com.ecomm.model.PasswordResetToken;
import com.ecomm.repo.PasswordResetTokenRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailTemplateService templateService;

    @Autowired
    private PasswordResetTokenRepository tokenRepo;

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.sender.name:Ecomm Team}")
    private String senderName;

    public void sendOrderConfirmation(String toEmail, String userName, Long orderId, double totalAmount) {
        try {
            String subject = "Your Order Confirmation - #" + orderId;
            String htmlContent = templateService.prepareOrderConfirmationTemplate(
                    userName, orderId, totalAmount
            );

            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            logger.info("Sending email to: {}", toEmail);
            logger.info("Subject: {}", subject);
            logger.info("From: {} ({})", fromEmail, senderName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Error sending email: ", e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }


    public void sendPasswordResetLink(String email, String username, String resetLink) {
        // Extract token from resetLink safely
        String token = extractTokenFromLink(resetLink);

        // Verify token exists in the database
        PasswordResetToken dbToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> {
                    logger.error("Attempted to send email for non-existent token: {}", token);
                    return new IllegalStateException("Token not found in database");
                });

        // Prepare and send the email
        String subject = "Password Reset Request";
        String htmlContent = templateService.preparePasswordResetTemplate(username, resetLink);
        sendHtmlEmail(email, subject, htmlContent); // Assumed method for sending HTML email
        logger.debug("Sent password reset email to {} with link {}", email, resetLink);
    }

    private String extractTokenFromLink(String resetLink) {
        String tokenKey = "token=";
        int startIndex = resetLink.indexOf(tokenKey);
        if (startIndex == -1) {
            logger.error("Invalid reset link format, no 'token=' found: {}", resetLink);
            throw new IllegalArgumentException("Invalid reset link format");
        }
        startIndex += tokenKey.length();

        // Handle case where token is the last parameter or followed by more query params
        int endIndex = resetLink.indexOf('&', startIndex);
        if (endIndex == -1) {
            endIndex = resetLink.length();
        }

        return resetLink.substring(startIndex, endIndex);
    }

}