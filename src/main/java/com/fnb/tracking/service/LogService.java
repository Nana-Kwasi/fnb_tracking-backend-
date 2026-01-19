package com.fnb.tracking.service;

import com.fnb.tracking.model.Log;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.LogRepository;
import com.fnb.tracking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LogService {
    @Autowired
    private LogRepository logRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public void logAction(Long userId, String actionType, String entityType, Long entityId, String description, String ipAddress) {
        Log log = new Log();
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(log::setUser);
        }
        log.setActionType(actionType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDescription(description);
        log.setIpAddress(ipAddress);
        logRepository.save(log);
    }
}
