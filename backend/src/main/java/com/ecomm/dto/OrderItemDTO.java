package com.ecomm.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
    
@Getter
@Setter
public class OrderItemDTO {
    private Long productId;
    private int quantity;
    private String productName;
    private double price;
    private String imageUrl;

}
