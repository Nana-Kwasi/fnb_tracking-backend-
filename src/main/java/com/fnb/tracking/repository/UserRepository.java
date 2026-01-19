package com.fnb.tracking.repository;

import com.fnb.tracking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.fNumber = :fNumber")
    Optional<User> findByFNumber(@Param("fNumber") String fNumber);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.fNumber = :fNumber")
    boolean existsByFNumber(@Param("fNumber") String fNumber);
}
