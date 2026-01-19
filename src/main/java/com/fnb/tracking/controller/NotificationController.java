package com.fnb.tracking.controller;

import com.fnb.tracking.dto.NotificationDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import com.fnb.tracking.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        List<NotificationDTO> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        Long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
