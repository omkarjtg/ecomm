package com.ecomm.dto;

public record PasswordResetResponse(
        boolean success,
        String token,
        String username
) {}