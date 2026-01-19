package com.fnb.tracking.dto;

public class StatusUpdateDTO {
    private String status;
    private String rejectionReason;
    
    public StatusUpdateDTO() {}
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
