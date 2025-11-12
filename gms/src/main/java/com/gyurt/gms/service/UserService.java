package com.gyurt.gms.service;

import com.gyurt.gms.dto.LoginResponse;
import com.gyurt.gms.model.User;
import com.gyurt.gms.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    JWTService jwtService;

    @Autowired
    UserRepository userRepository;

    public LoginResponse verify(User user){
        log.info("Attempting login for user: {}", user.getEmail());
        
        try {
            User foundUser = userRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + user.getEmail()));
            
            log.info("User found in DB: {}, role: {}", foundUser.getEmail(), foundUser.getRole());
            log.debug("Stored password hash starts with: {}", foundUser.getPassword().substring(0, 10));
            
            Authentication authentication =
                    authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                log.info("Authentication successful for user: {}", user.getEmail());
                String token = jwtService.generateToken(user.getEmail());
                return new LoginResponse(token, foundUser.getRole().name(), foundUser.getEmail());
            }
        } catch (Exception e) {
            log.error("Authentication failed for user {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }

        throw new RuntimeException("Authentication failed");
    }
}
