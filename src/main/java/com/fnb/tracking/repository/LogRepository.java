package com.fnb.tracking.repository;

import com.fnb.tracking.model.Log;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findByUserId(Long userId);
    List<Log> findByUserId(Long userId, Pageable pageable);
    List<Log> findByActionType(String actionType);
    List<Log> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    @Query("SELECT l FROM Log l WHERE l.user.id = :userId AND l.createdAt BETWEEN :startOfDay AND :endOfDay ORDER BY l.createdAt DESC")
    List<Log> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay, Pageable pageable);
}
