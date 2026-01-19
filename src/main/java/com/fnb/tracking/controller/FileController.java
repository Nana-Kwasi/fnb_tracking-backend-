package com.fnb.tracking.controller;

import com.fnb.tracking.model.Attachment;
import com.fnb.tracking.model.Project;
import com.fnb.tracking.model.ChangeRequest;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.AttachmentRepository;
import com.fnb.tracking.repository.ProjectRepository;
import com.fnb.tracking.repository.ChangeRequestRepository;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {
    @Autowired
    private AttachmentRepository attachmentRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ChangeRequestRepository changeRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private static final String UPLOAD_DIR = "uploads";
    
    private Path getUploadPath() throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        return uploadPath;
    }
    
    private Long getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String fNumber = jwtUtil.extractUsername(token);
        User user = userRepository.findByFNumber(fNumber).orElseThrow();
        return user.getId();
    }
    
    @PostMapping("/upload")
    public ResponseEntity<List<Attachment>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam(value = "changeRequestId", required = false) Long changeRequestId,
            HttpServletRequest request) {
        
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Long userId = getCurrentUserId(request);
        User user = userRepository.findById(userId).orElseThrow();
        List<Attachment> savedAttachments = new ArrayList<>();
        
        try {
            Path uploadPath = getUploadPath();
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                
                String originalFileName = file.getOriginalFilename();
                String fileExtension = originalFileName != null && originalFileName.contains(".") 
                    ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
                    : "";
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = uploadPath.resolve(uniqueFileName);
                
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                Attachment attachment = new Attachment();
                if (projectId != null) {
                    Project project = projectRepository.findById(projectId).orElseThrow();
                    attachment.setProject(project);
                }
                if (changeRequestId != null) {
                    ChangeRequest changeRequest = changeRequestRepository.findById(changeRequestId).orElseThrow();
                    attachment.setChangeRequest(changeRequest);
                }
                attachment.setFileName(originalFileName);
                attachment.setFilePath(filePath.toString());
                attachment.setFileSize(file.getSize());
                attachment.setUploadedBy(user);
                
                savedAttachments.add(attachmentRepository.save(attachment));
            }
            
            return ResponseEntity.ok(savedAttachments);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentRepository.findById(id).orElseThrow();
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentRepository.findById(id).orElseThrow();
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "inline; filename=\"" + attachment.getFileName() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Attachment>> getProjectFiles(@PathVariable Long projectId) {
        List<Attachment> attachments = attachmentRepository.findByProjectId(projectId);
        return ResponseEntity.ok(attachments);
    }
    
    @GetMapping("/change-request/{changeRequestId}")
    public ResponseEntity<List<Attachment>> getChangeRequestFiles(@PathVariable Long changeRequestId) {
        List<Attachment> attachments = attachmentRepository.findByChangeRequestId(changeRequestId);
        return ResponseEntity.ok(attachments);
    }
}
