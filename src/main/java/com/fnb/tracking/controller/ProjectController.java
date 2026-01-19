package com.fnb.tracking.controller;

import com.fnb.tracking.dto.ProjectDTO;
import com.fnb.tracking.dto.StatusUpdateDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import com.fnb.tracking.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    
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
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO dto, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        ProjectDTO created = projectService.createProject(dto, userId);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getProjects(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String role = jwtUtil.extractRole(token);
        
        List<ProjectDTO> projects;
        if ("ADMIN".equals(role)) {
            projects = projectService.getAllProjects();
        } else {
            Long userId = getCurrentUserId(request);
            projects = projectService.getUserProjects(userId);
        }
        
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long id) {
        ProjectDTO project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }
    
    @GetMapping("/search/{projectId}")
    public ResponseEntity<ProjectDTO> getProjectByProjectId(@PathVariable String projectId) {
        ProjectDTO project = projectService.getProjectByProjectId(projectId);
        return ResponseEntity.ok(project);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody ProjectDTO dto, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        try {
            ProjectDTO updated = projectService.updateProject(id, dto, userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ProjectDTO> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusUpdate, HttpServletRequest request) {
        Long adminId = getCurrentUserId(request);
        ProjectDTO updated = projectService.updateProjectStatus(id, statusUpdate, adminId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ProjectDTO> deleteProject(@PathVariable Long id, @RequestBody DeleteProjectRequest deleteRequest, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String role = jwtUtil.extractRole(token);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        Long adminId = getCurrentUserId(request);
        try {
            ProjectDTO deleted = projectService.deleteProject(id, deleteRequest.getDeletionReason(), adminId);
            return ResponseEntity.ok(deleted);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/deleted")
    public ResponseEntity<List<ProjectDTO>> getDeletedProjects(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String role = jwtUtil.extractRole(token);
        Long userId = getCurrentUserId(request);
        List<ProjectDTO> deletedProjects = projectService.getDeletedProjects(userId, role);
        return ResponseEntity.ok(deletedProjects);
    }
    
    public static class DeleteProjectRequest {
        private String deletionReason;
        
        public String getDeletionReason() {
            return deletionReason;
        }
        
        public void setDeletionReason(String deletionReason) {
            this.deletionReason = deletionReason;
        }
    }
}
