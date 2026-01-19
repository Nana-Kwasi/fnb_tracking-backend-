package com.fnb.tracking.repository;

import com.fnb.tracking.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);
    Long countByUserIdAndIsRead(Long userId, Boolean isRead);
    List<Notification> findByChangeRequestId(Long changeRequestId);
}
