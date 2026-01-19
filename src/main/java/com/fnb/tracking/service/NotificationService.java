package com.fnb.tracking.service;

import com.fnb.tracking.dto.NotificationDTO;
import com.fnb.tracking.model.Notification;
import com.fnb.tracking.model.User;
import com.fnb.tracking.model.Project;
import com.fnb.tracking.model.ChangeRequest;
import com.fnb.tracking.repository.NotificationRepository;
import com.fnb.tracking.repository.UserRepository;
import com.fnb.tracking.repository.ProjectRepository;
import com.fnb.tracking.repository.ChangeRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ChangeRequestRepository changeRequestRepository;
    
    public void createNotification(Long userId, Long projectId, Long changeRequestId, String type, String message) {
        User user = userRepository.findById(userId).orElseThrow();
        
        Notification notification = new Notification();
        notification.setUser(user);
        if (projectId != null) {
            Project project = projectRepository.findById(projectId).orElse(null);
            notification.setProject(project);
        }
        if (changeRequestId != null) {
            ChangeRequest changeRequest = changeRequestRepository.findById(changeRequestId).orElse(null);
            notification.setChangeRequest(changeRequest);
        }
        notification.setNotificationType(type);
        notification.setMessage(message);
        
        notificationRepository.save(notification);
        
        // TODO: Integrate with external notification API
    }
    
    public List<NotificationDTO> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setNotificationType(notification.getNotificationType());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        
        if (notification.getProject() != null) {
            dto.setProjectId(notification.getProject().getId());
            dto.setProjectProjectId(notification.getProject().getProjectId());
        }
        
        if (notification.getChangeRequest() != null) {
            dto.setChangeRequestId(notification.getChangeRequest().getId());
        }
        
        return dto;
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        // Verify the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Notification does not belong to user");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
