package com.fnb.tracking.repository;

import com.fnb.tracking.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByProjectId(Long projectId);
    List<Attachment> findByChangeRequestId(Long changeRequestId);
}
