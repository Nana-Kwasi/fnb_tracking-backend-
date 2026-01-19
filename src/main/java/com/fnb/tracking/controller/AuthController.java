package com.fnb.tracking.controller;

import com.fnb.tracking.dto.LoginRequest;
import com.fnb.tracking.dto.LoginResponse;
import com.fnb.tracking.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            String ipAddress = httpRequest.getRemoteAddr();
            LoginResponse response = authService.login(request, ipAddress);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if ("ACCOUNT_SUSPENDED".equals(e.getMessage())) {
                return ResponseEntity.status(403).build();
            }
            throw e;
        }
    }
}
