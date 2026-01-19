package com.fnb.tracking.repository;

import com.fnb.tracking.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectId(String projectId);
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.attachments WHERE p.loggedBy.id = :userId AND (p.isDeleted IS NULL OR p.isDeleted = false)")
    List<Project> findByLoggedById(Long userId);
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.attachments WHERE (p.isDeleted IS NULL OR p.isDeleted = false)")
    List<Project> findAllWithAttachments();
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.attachments WHERE p.isDeleted = true")
    List<Project> findDeletedProjects();
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.attachments WHERE p.isDeleted = true AND p.loggedBy.id = :userId")
    List<Project> findDeletedProjectsByUser(Long userId);
    
    List<Project> findByStatus(String status);
    boolean existsByProjectId(String projectId);
}
