package com.ecomm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @JsonProperty("identifier")
    private String identifier;

    @JsonProperty("password")
    private String password;

}