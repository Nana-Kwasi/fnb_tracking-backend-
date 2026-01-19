package com.fnb.tracking.controller;

import com.fnb.tracking.model.Log;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.LogRepository;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:3000")
public class LogController {
    @Autowired
    private LogRepository logRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<Log>> getLogs(
            @RequestParam(required = false) String date,
            HttpServletRequest request) {
        // Get current user from token
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        
        List<Log> logs;
        
        if (date != null && !date.isEmpty()) {
            try {
                LocalDate localDate = LocalDate.parse(date);
                LocalDateTime startOfDay = localDate.atStartOfDay();
                LocalDateTime endOfDay = localDate.atTime(23, 59, 59);
                // Filter by user ID - admins only see their own logs
                logs = logRepository.findByUserIdAndCreatedAtBetween(
                    user.getId(),
                    startOfDay, 
                    endOfDay,
                    PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt"))
                );
            } catch (Exception e) {
                // Invalid date format, return latest 10 logs for this user
                Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
                logs = logRepository.findByUserId(user.getId(), pageable);
            }
        } else {
            // Get latest 10 logs for this user only
            Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
            logs = logRepository.findByUserId(user.getId(), pageable);
        }
        
        return ResponseEntity.ok(logs);
    }
}
