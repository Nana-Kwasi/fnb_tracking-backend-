package com.fnb.tracking.service;

import com.fnb.tracking.dto.UserDTO;
import com.fnb.tracking.model.User;
import com.fnb.tracking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LogService logService;
    
    public UserDTO createUser(UserDTO dto) {
        if (userRepository.existsByFNumber(dto.getFNumber())) {
            throw new RuntimeException("F-number already exists");
        }
        
        User user = new User();
        user.setFNumber(dto.getFNumber());
        user.setPassword("password123"); // Default password
        user.setRole(User.Role.valueOf(dto.getRole()));
        user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(User.Role.valueOf(dto.getRole()));
        user.setIsActive(dto.getIsActive());
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        userRepository.delete(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFNumber(user.getFNumber());
        dto.setRole(user.getRole().name());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
}
