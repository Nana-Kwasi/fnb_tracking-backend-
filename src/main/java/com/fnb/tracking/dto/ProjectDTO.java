package com.fnb.tracking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectDTO {
    private Long id;
    private String projectId;
    private String projectName;
    private String department;
    private String branch;
    private String description;
    private String priorityLevel;
    private String status;
    private String loggedBy;
    private Long loggedById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentDTO> attachments;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private String deletionReason;
    private String rejectionReason;
    private String updatedBy;
    
    public ProjectDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLoggedBy() { return loggedBy; }
    public void setLoggedBy(String loggedBy) { this.loggedBy = loggedBy; }
    public Long getLoggedById() { return loggedById; }
    public void setLoggedById(Long loggedById) { this.loggedById = loggedById; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<AttachmentDTO> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDTO> attachments) { this.attachments = attachments; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }
    public String getDeletionReason() { return deletionReason; }
    public void setDeletionReason(String deletionReason) { this.deletionReason = deletionReason; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
