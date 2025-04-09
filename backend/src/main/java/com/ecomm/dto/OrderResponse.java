package com.ecomm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private String razorpayOrderId;
    private double amount;
    private String currency = "INR";
    private Long orderId;
    private String status;
    private Instant orderDate;
    private List<OrderItemDTO> items;
}
