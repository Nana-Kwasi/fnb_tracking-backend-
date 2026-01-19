package com.fnb.tracking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {
    private String token;
    
    @JsonProperty("fNumber")
    private String fNumber;
    
    private String role;
    
    public LoginResponse() {}
    
    public LoginResponse(String token, String fNumber, String role) {
        this.token = token;
        this.fNumber = fNumber;
        this.role = role;
    }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getFNumber() { return fNumber; }
    public void setFNumber(String fNumber) { this.fNumber = fNumber; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
