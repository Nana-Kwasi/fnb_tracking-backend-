package com.fnb.tracking.repository;

import com.fnb.tracking.model.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    @Query("SELECT DISTINCT cr FROM ChangeRequest cr LEFT JOIN FETCH cr.attachments WHERE cr.loggedBy.id = :userId")
    List<ChangeRequest> findByLoggedById(Long userId);
    
    @Query("SELECT DISTINCT cr FROM ChangeRequest cr LEFT JOIN FETCH cr.attachments WHERE cr.project.id = :projectId")
    List<ChangeRequest> findByProjectId(Long projectId);
    
    @Query("SELECT DISTINCT cr FROM ChangeRequest cr LEFT JOIN FETCH cr.attachments")
    List<ChangeRequest> findAllWithAttachments();
    
    List<ChangeRequest> findByStatus(String status);
}
