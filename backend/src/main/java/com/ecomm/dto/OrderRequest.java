package com.ecomm.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderRequest {
    private Long userId;
    private List<OrderItemDTO> items;
}
