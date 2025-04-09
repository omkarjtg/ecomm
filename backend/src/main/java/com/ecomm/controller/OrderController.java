package com.ecomm.controller;

import com.ecomm.dto.OrderRequest;
import com.ecomm.dto.OrderResponse;
import com.ecomm.model.Order;
import com.ecomm.service.OrderService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;


    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest orderRequest,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order order = orderService.createAndPlaceOrder(orderRequest.getUserId(), orderRequest);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable Long userId) {
        try {
            List<OrderResponse> response = orderService.getUserOrders(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }



}
