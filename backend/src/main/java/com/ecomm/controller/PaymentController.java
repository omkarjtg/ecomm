package com.ecomm.controller;

import com.ecomm.dto.PaymentRequest;
import com.ecomm.service.OrderService;
import com.ecomm.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create-order")
    public String createOrder(@RequestBody PaymentRequest paymentRequest) throws RazorpayException {
        return paymentService.createOrder(paymentRequest.getAmount(), "INR", "order_receipt_123");
    }

    @PostMapping("/verify")
    public boolean verifyPayment(@RequestBody Map<String, String> payload) {
        String orderId = payload.get("orderId");
        String paymentId = payload.get("paymentId");
        String signature = payload.get("signature");

        return paymentService.verifyPayment(orderId, paymentId, signature);
    }

    @GetMapping("/order-date/{razorpayOrderId}")
    public LocalDateTime getOrderDate(@PathVariable String razorpayOrderId) {
        return paymentService.getOrderCreationTime(razorpayOrderId);
    }
}