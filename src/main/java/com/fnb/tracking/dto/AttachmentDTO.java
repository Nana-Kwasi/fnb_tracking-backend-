package com.fnb.tracking.dto;

public class AttachmentDTO {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String uploadedBy;
    
    public AttachmentDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
