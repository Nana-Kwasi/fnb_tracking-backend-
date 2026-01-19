package com.fnb.tracking.controller;

import com.fnb.tracking.dto.ProjectDTO;
import com.fnb.tracking.dto.ChangeRequestDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import com.fnb.tracking.service.ProjectService;
import com.fnb.tracking.service.ChangeRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private ChangeRequestService changeRequestService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String projectType,
            HttpServletRequest request) {
        
        // Extract user info from JWT token (already validated by JwtAuthenticationFilter)
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(403).build();
        }
        
        String token = authHeader.substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        
        // Get all projects and change requests (admin gets all, users get their own)
        List<ProjectDTO> allProjects;
        List<ChangeRequestDTO> allChangeRequests;
        
        if ("ADMIN".equals(role)) {
            allProjects = projectService.getAllProjects();
            allChangeRequests = changeRequestService.getAllChangeRequests();
        } else {
            allProjects = projectService.getUserProjects(user.getId());
            allChangeRequests = changeRequestService.getUserChangeRequests(user.getId());
        }
        
        // Filter projects
        List<ProjectDTO> filteredProjects = allProjects.stream()
                .filter(p -> {
                    if (dateFrom != null && !dateFrom.isEmpty()) {
                        try {
                            LocalDateTime fromDate = LocalDateTime.parse(dateFrom + "T00:00:00");
                            if (p.getCreatedAt() != null && p.getCreatedAt().isBefore(fromDate)) return false;
                        } catch (Exception e) {
                            // Invalid date format, skip filter
                        }
                    }
                    if (dateTo != null && !dateTo.isEmpty()) {
                        try {
                            LocalDateTime toDate = LocalDateTime.parse(dateTo + "T23:59:59");
                            if (p.getCreatedAt() != null && p.getCreatedAt().isAfter(toDate)) return false;
                        } catch (Exception e) {
                            // Invalid date format, skip filter
                        }
                    }
                    if (status != null && !status.isEmpty() && p.getStatus() != null && !p.getStatus().equals(status)) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        // Filter change requests
        List<ChangeRequestDTO> filteredChangeRequests = allChangeRequests.stream()
                .filter(cr -> {
                    if (dateFrom != null && !dateFrom.isEmpty()) {
                        try {
                            LocalDateTime fromDate = LocalDateTime.parse(dateFrom + "T00:00:00");
                            if (cr.getCreatedAt() != null && cr.getCreatedAt().isBefore(fromDate)) return false;
                        } catch (Exception e) {
                            // Invalid date format, skip filter
                        }
                    }
                    if (dateTo != null && !dateTo.isEmpty()) {
                        try {
                            LocalDateTime toDate = LocalDateTime.parse(dateTo + "T23:59:59");
                            if (cr.getCreatedAt() != null && cr.getCreatedAt().isAfter(toDate)) return false;
                        } catch (Exception e) {
                            // Invalid date format, skip filter
                        }
                    }
                    if (status != null && !status.isEmpty() && cr.getStatus() != null && !cr.getStatus().equals(status)) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        // Combine results based on projectType
        Map<String, Object> report = new HashMap<>();
        
        if (projectType == null || projectType.isEmpty() || "PROJECT".equals(projectType)) {
            report.put("projects", filteredProjects);
            report.put("projectCount", filteredProjects.size());
        }
        
        if (projectType == null || projectType.isEmpty() || "CHANGE_REQUEST".equals(projectType)) {
            report.put("changeRequests", filteredChangeRequests);
            report.put("changeRequestCount", filteredChangeRequests.size());
        }
        
        int total = 0;
        if (projectType == null || projectType.isEmpty()) {
            total = filteredProjects.size() + filteredChangeRequests.size();
        } else if ("PROJECT".equals(projectType)) {
            total = filteredProjects.size();
        } else if ("CHANGE_REQUEST".equals(projectType)) {
            total = filteredChangeRequests.size();
        }
        
        report.put("total", total);
        
        return ResponseEntity.ok(report);
    }
}
