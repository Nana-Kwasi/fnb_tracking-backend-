package com.fnb.tracking.service;

import com.fnb.tracking.dto.LoginRequest;
import com.fnb.tracking.dto.LoginResponse;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private LogService logService;
    
    public LoginResponse login(LoginRequest request, String ipAddress) {
        Optional<User> userOpt = userRepository.findByFNumber(request.getUsername());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }
        
        User user = userOpt.get();
        if (!user.getIsActive()) {
            throw new RuntimeException("ACCOUNT_SUSPENDED");
        }
        
        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user.getFNumber(), user.getRole().name());
        logService.logAction(user.getId(), "LOGIN", "USER", user.getId(), "User logged in", ipAddress);
        
        return new LoginResponse(token, user.getFNumber(), user.getRole().name());
    }
}
