package com.fnb.tracking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChangeRequestDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String projectProjectId;
    private String requestedFeature;
    private String reasonForChange;
    private String impactLevel;
    private String status;
    private String loggedBy;
    private Long loggedById;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentDTO> attachments;
    
    public ChangeRequestDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getProjectProjectId() { return projectProjectId; }
    public void setProjectProjectId(String projectProjectId) { this.projectProjectId = projectProjectId; }
    public String getRequestedFeature() { return requestedFeature; }
    public void setRequestedFeature(String requestedFeature) { this.requestedFeature = requestedFeature; }
    public String getReasonForChange() { return reasonForChange; }
    public void setReasonForChange(String reasonForChange) { this.reasonForChange = reasonForChange; }
    public String getImpactLevel() { return impactLevel; }
    public void setImpactLevel(String impactLevel) { this.impactLevel = impactLevel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLoggedBy() { return loggedBy; }
    public void setLoggedBy(String loggedBy) { this.loggedBy = loggedBy; }
    public Long getLoggedById() { return loggedById; }
    public void setLoggedById(Long loggedById) { this.loggedById = loggedById; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<AttachmentDTO> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDTO> attachments) { this.attachments = attachments; }
}
