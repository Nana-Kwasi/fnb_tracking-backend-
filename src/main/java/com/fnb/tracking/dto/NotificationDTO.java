package com.fnb.tracking.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private Long projectId;
    private String projectProjectId;
    private Long changeRequestId;
    private String notificationType;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    public NotificationDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectProjectId() { return projectProjectId; }
    public void setProjectProjectId(String projectProjectId) { this.projectProjectId = projectProjectId; }
    public Long getChangeRequestId() { return changeRequestId; }
    public void setChangeRequestId(Long changeRequestId) { this.changeRequestId = changeRequestId; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
