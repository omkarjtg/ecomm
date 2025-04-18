package com.ecomm.service;

import com.ecomm.dto.OrderItemDTO;
import com.ecomm.dto.OrderRequest;
import com.ecomm.dto.OrderResponse;
import com.ecomm.model.Order;
import com.ecomm.model.OrderItem;
import com.ecomm.model.Product;
import com.ecomm.model.User;
import com.ecomm.repo.OrderRepository;
import com.ecomm.repo.ProductRepo;
import com.ecomm.repo.UserRepo;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    @Autowired
    private EmailService emailService;

    private final OrderRepository orderRepository;
    private final ProductRepo productRepository;
    private final UserRepo userRepository;
    private final PaymentService razorPayService;

    public Order createAndPlaceOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        double calculatedTotal = 0;

        for (OrderItemDTO item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());
            calculatedTotal += product.getPrice() * item.getQuantity();
            orderItems.add(orderItem);
        }

        if (Math.abs(calculatedTotal - request.getTotalAmount()) > 1) {
            throw new RuntimeException("Total mismatch. Expected: " + calculatedTotal);
        }

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(calculatedTotal);
        order.setPaymentStatus("PAID");
        order.setRazorpayOrderId(request.getRazorpayOrderId());
        order.setOrderDate(Instant.now());
        order.setItems(orderItems);
        orderItems.forEach(item -> item.setOrder(order));

        // Update stock
        for (OrderItemDTO item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId()).get();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        emailService.sendOrderConfirmation(user.getEmail(), user.getUsername(), order.getId(), calculatedTotal);

        return orderRepository.save(order);
    }


    public List<Order> getOrdersByUserId(Long userId) {

        return orderRepository.findAllByUserId(userId);

    }

    public List<OrderResponse> getUserOrders(Long userId) {
        // Use the new repository method that fetches products
        List<Order> orders = orderRepository.findAllByUserIdWithItemsAndProducts(userId);

        return orders.stream().map(order -> {
            OrderResponse dto = new OrderResponse();
            dto.setRazorpayOrderId(order.getRazorpayOrderId());
            dto.setAmount(order.getTotalAmount());
            dto.setCurrency("INR");
            dto.setOrderId(order.getId());
            dto.setStatus(order.getPaymentStatus());
            dto.setOrderDate(order.getOrderDate());

            // Now items and products are properly loaded
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDto = new OrderItemDTO();
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setPrice(item.getProduct().getPrice());
                itemDto.setImageUrl("/api/product/" + item.getProduct().getId() + "/image");
                return itemDto;
            }).collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
