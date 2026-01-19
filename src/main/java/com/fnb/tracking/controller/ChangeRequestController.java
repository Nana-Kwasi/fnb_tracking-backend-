package com.fnb.tracking.controller;

import com.fnb.tracking.dto.ChangeRequestDTO;
import com.fnb.tracking.dto.StatusUpdateDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import com.fnb.tracking.service.ChangeRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/change-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class ChangeRequestController {
    @Autowired
    private ChangeRequestService changeRequestService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    private Long getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        return user.getId();
    }
    
    @PostMapping
    public ResponseEntity<ChangeRequestDTO> createChangeRequest(@RequestBody ChangeRequestDTO dto, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        ChangeRequestDTO created = changeRequestService.createChangeRequest(dto, userId);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping
    public ResponseEntity<List<ChangeRequestDTO>> getChangeRequests(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String role = jwtUtil.extractRole(token);
        
        List<ChangeRequestDTO> changeRequests;
        if ("ADMIN".equals(role)) {
            changeRequests = changeRequestService.getAllChangeRequests();
        } else {
            Long userId = getCurrentUserId(request);
            changeRequests = changeRequestService.getUserChangeRequests(userId);
        }
        
        return ResponseEntity.ok(changeRequests);
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ChangeRequestDTO>> getChangeRequestsByProject(@PathVariable Long projectId) {
        List<ChangeRequestDTO> changeRequests = changeRequestService.getChangeRequestsByProject(projectId);
        return ResponseEntity.ok(changeRequests);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ChangeRequestDTO> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusUpdate, HttpServletRequest request) {
        Long adminId = getCurrentUserId(request);
        ChangeRequestDTO updated = changeRequestService.updateChangeRequestStatus(id, statusUpdate, adminId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChangeRequest(@PathVariable Long id, @RequestBody(required = false) DeleteChangeRequestRequest deleteRequest, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String role = jwtUtil.extractRole(token);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        try {
            changeRequestService.deleteChangeRequest(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    public static class DeleteChangeRequestRequest {
        private String deletionReason;
        
        public String getDeletionReason() {
            return deletionReason;
        }
        
        public void setDeletionReason(String deletionReason) {
            this.deletionReason = deletionReason;
        }
    }
}
