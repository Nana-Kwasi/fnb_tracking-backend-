package com.fnb.tracking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "change_requests")
public class ChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Column(name = "requested_feature", nullable = false, columnDefinition = "TEXT")
    private String requestedFeature;
    
    @Column(name = "reason_for_change", columnDefinition = "TEXT")
    private String reasonForChange;
    
    @Column(name = "impact_level")
    private String impactLevel;
    
    @Column(nullable = false)
    private String status = "PENDING";
    
    @ManyToOne
    @JoinColumn(name = "logged_by", nullable = false)
    private User loggedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "changeRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Attachment> attachments;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getRequestedFeature() { return requestedFeature; }
    public void setRequestedFeature(String requestedFeature) { this.requestedFeature = requestedFeature; }
    public String getReasonForChange() { return reasonForChange; }
    public void setReasonForChange(String reasonForChange) { this.reasonForChange = reasonForChange; }
    public String getImpactLevel() { return impactLevel; }
    public void setImpactLevel(String impactLevel) { this.impactLevel = impactLevel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getLoggedBy() { return loggedBy; }
    public void setLoggedBy(User loggedBy) { this.loggedBy = loggedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Attachment> getAttachments() { return attachments; }
    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }
}
