package com.ecomm.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class EmailTemplateService {

    private String loadTemplateFromClasspath(String filePath) {
        try {
            ClassPathResource resource = new ClassPathResource(filePath);
            byte[] bytes = FileCopyUtils.copyToByteArray(resource.getInputStream());
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load template: " + filePath, e);
        }
    }

    public String prepareOrderConfirmationTemplate(String username, Long orderId, double totalAmount) {
        String template = loadTemplateFromClasspath("templates/email/order-confirmation.html");
        return template
                .replace("{{username}}", username)
                .replace("{{orderId}}", String.valueOf(orderId))
                .replace("{{total}}", String.format("%.2f", totalAmount));
    }

    public String preparePasswordResetTemplate(String username, String resetLink) {
        String template = loadTemplateFromClasspath("templates/email/reset_password_template.html");
        {
            return template
                    .replace("{{username}}", username)
                    .replace("{{resetLink}}", resetLink);
        }
    }

}
