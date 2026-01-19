package com.fnb.tracking.controller;

import com.fnb.tracking.dto.DashboardStatsDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import com.fnb.tracking.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {
    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<DashboardStatsDTO> getDashboard(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        
        DashboardStatsDTO stats;
        if ("ADMIN".equals(role)) {
            stats = dashboardService.getAdminDashboard();
        } else {
            stats = dashboardService.getUserDashboard(user.getId());
        }
        
        return ResponseEntity.ok(stats);
    }
}
