package com.fnb.tracking.service;

import com.fnb.tracking.dto.AttachmentDTO;
import com.fnb.tracking.dto.ProjectDTO;
import com.fnb.tracking.dto.StatusUpdateDTO;
import com.fnb.tracking.model.Project;
import com.fnb.tracking.model.StatusHistory;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.ProjectRepository;
import com.fnb.tracking.repository.StatusHistoryRepository;
import com.fnb.tracking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StatusHistoryRepository statusHistoryRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private LogService logService;
    
    private String generateProjectId() {
        Random random = new Random();
        int randomDigits = random.nextInt(100);
        return "FNBPJ" + String.format("%02d", randomDigits);
    }
    
    public ProjectDTO createProject(ProjectDTO dto, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        String projectId;
        do {
            projectId = generateProjectId();
        } while (projectRepository.existsByProjectId(projectId));
        
        Project project = new Project();
        project.setProjectId(projectId);
        project.setProjectName(dto.getProjectName());
        project.setDepartment(dto.getDepartment());
        project.setBranch(dto.getBranch());
        project.setDescription(dto.getDescription());
        project.setPriorityLevel(Project.PriorityLevel.valueOf(dto.getPriorityLevel()));
        project.setStatus("PENDING");
        project.setLoggedBy(user);
        
        project = projectRepository.save(project);
        logService.logAction(userId, "CREATE_PROJECT", "PROJECT", project.getId(), "Created project: " + projectId, null);
        
        return convertToDTO(project);
    }
    
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAllWithAttachments().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ProjectDTO> getUserProjects(Long userId) {
        return projectRepository.findByLoggedById(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ProjectDTO getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        // Force load attachments
        if (project.getAttachments() != null) {
            project.getAttachments().size(); // Trigger lazy loading
        }
        return convertToDTO(project);
    }
    
    public ProjectDTO getProjectByProjectId(String projectId) {
        Project project = projectRepository.findByProjectId(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        // Force load attachments
        if (project.getAttachments() != null) {
            project.getAttachments().size(); // Trigger lazy loading
        }
        return convertToDTO(project);
    }
    
    public ProjectDTO updateProject(Long projectId, ProjectDTO dto, Long userId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        
        // Check if user is the creator
        if (!project.getLoggedBy().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own projects");
        }
        
        // Check if within 15 minutes
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(project.getCreatedAt(), now);
        if (duration.toMinutes() > 15) {
            throw new RuntimeException("Projects can only be edited within 15 minutes of creation");
        }
        
        project.setProjectName(dto.getProjectName());
        project.setDepartment(dto.getDepartment());
        project.setBranch(dto.getBranch());
        project.setDescription(dto.getDescription());
        project.setPriorityLevel(Project.PriorityLevel.valueOf(dto.getPriorityLevel()));
        
        project = projectRepository.save(project);
        logService.logAction(userId, "UPDATE_PROJECT", "PROJECT", projectId, 
            "Updated project: " + project.getProjectId(), null);
        
        return convertToDTO(project);
    }
    
    @Transactional
    public ProjectDTO deleteProject(Long projectId, String deletionReason, Long adminId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        User admin = userRepository.findById(adminId).orElseThrow();
        
        if (project.getIsDeleted() != null && project.getIsDeleted()) {
            throw new RuntimeException("Project is already deleted");
        }
        
        project.setIsDeleted(true);
        project.setDeletedAt(LocalDateTime.now());
        project.setDeletedBy(admin);
        project.setDeletionReason(deletionReason);
        
        project = projectRepository.save(project);
        
        // Notify the user who created the project
        notificationService.createNotification(
            project.getLoggedBy().getId(),
            project.getId(),
            null,
            "PROJECT_DELETED",
            "Your project " + project.getProjectId() + " has been deleted. Reason: " + deletionReason
        );
        
        logService.logAction(adminId, "DELETE_PROJECT", "PROJECT", projectId, 
            "Deleted project: " + project.getProjectId() + ". Reason: " + deletionReason, null);
        
        return convertToDTO(project);
    }
    
    public List<ProjectDTO> getDeletedProjects(Long userId, String role) {
        List<Project> deletedProjects;
        if ("ADMIN".equals(role)) {
            deletedProjects = projectRepository.findDeletedProjects();
        } else {
            deletedProjects = projectRepository.findDeletedProjectsByUser(userId);
        }
        return deletedProjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProjectDTO updateProjectStatus(Long projectId, StatusUpdateDTO statusUpdate, Long adminId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        User admin = userRepository.findById(adminId).orElseThrow();
        
        String oldStatus = project.getStatus();
        project.setStatus(statusUpdate.getStatus());
        
        StatusHistory history = new StatusHistory();
        history.setProject(project);
        history.setOldStatus(oldStatus);
        history.setNewStatus(statusUpdate.getStatus());
        history.setUpdatedBy(admin);
        if ("REJECTED".equals(statusUpdate.getStatus()) && statusUpdate.getRejectionReason() != null && !statusUpdate.getRejectionReason().trim().isEmpty()) {
            history.setRejectionReason(statusUpdate.getRejectionReason().trim());
        }
        statusHistoryRepository.save(history);
        
        project = projectRepository.save(project);
        
        // Flush to ensure StatusHistory is saved before converting to DTO
        statusHistoryRepository.flush();
        
        notificationService.createNotification(
            project.getLoggedBy().getId(),
            project.getId(),
            null,
            "STATUS_UPDATE",
            "Project " + project.getProjectId() + " status updated to " + statusUpdate.getStatus()
        );
        
        logService.logAction(adminId, "UPDATE_STATUS", "PROJECT", projectId, 
            "Updated project status from " + oldStatus + " to " + statusUpdate.getStatus(), null);
        
        return convertToDTO(project);
    }
    
    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setProjectId(project.getProjectId());
        dto.setProjectName(project.getProjectName());
        dto.setDepartment(project.getDepartment());
        dto.setBranch(project.getBranch());
        dto.setDescription(project.getDescription());
        dto.setPriorityLevel(project.getPriorityLevel() != null ? project.getPriorityLevel().name() : null);
        dto.setStatus(project.getStatus());
        dto.setLoggedBy(project.getLoggedBy().getFNumber());
        dto.setLoggedById(project.getLoggedBy().getId());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        dto.setIsDeleted(project.getIsDeleted());
        dto.setDeletedAt(project.getDeletedAt());
        if (project.getDeletedBy() != null) {
            dto.setDeletedBy(project.getDeletedBy().getFNumber());
        }
        dto.setDeletionReason(project.getDeletionReason());
        
        // Get latest rejection reason if status is REJECTED
        if ("REJECTED".equals(project.getStatus())) {
            List<StatusHistory> rejectionHistory = statusHistoryRepository.findRejectionHistoryByProjectId(project.getId());
            if (!rejectionHistory.isEmpty()) {
                dto.setRejectionReason(rejectionHistory.get(0).getRejectionReason());
            }
        }
        
        // Get latest status update to find who updated it
        List<StatusHistory> latestHistory = statusHistoryRepository.findLatestByProjectId(project.getId());
        if (!latestHistory.isEmpty()) {
            StatusHistory latest = latestHistory.get(0);
            if (latest.getUpdatedBy() != null) {
                dto.setUpdatedBy(latest.getUpdatedBy().getFNumber());
            }
        }
        
        // Convert attachments
        List<AttachmentDTO> attachmentDTOs = new ArrayList<>();
        if (project.getAttachments() != null && !project.getAttachments().isEmpty()) {
            attachmentDTOs = project.getAttachments().stream()
                .map(att -> {
                    AttachmentDTO attDTO = new AttachmentDTO();
                    attDTO.setId(att.getId());
                    attDTO.setFileName(att.getFileName());
                    attDTO.setFileSize(att.getFileSize());
                    attDTO.setUploadedBy(att.getUploadedBy().getFNumber());
                    return attDTO;
                })
                .collect(Collectors.toList());
        }
        dto.setAttachments(attachmentDTOs);
        
        return dto;
    }
}
