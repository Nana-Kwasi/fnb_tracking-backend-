package com.fnb.tracking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDTO {
    private Long id;
    
    @JsonProperty("fNumber")
    private String fNumber;
    
    private String role;
    private Boolean isActive;
    
    public UserDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFNumber() { return fNumber; }
    public void setFNumber(String fNumber) { this.fNumber = fNumber; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
