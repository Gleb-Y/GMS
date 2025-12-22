package com.gyurt.gms.service;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JWTServiceTest {

    private JWTService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JWTService();
        userDetails = User.builder()
                .username("test@gms.com")
                .password("password")
                .authorities(new ArrayList<>())
                .build();
    }

    @Test
    void testGenerateToken() {
        String token = jwtService.generateToken("test@gms.com");

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void testExtractUserName() {
        String token = jwtService.generateToken("test@gms.com");

        String username = jwtService.extractUserName(token);

        assertEquals("test@gms.com", username);
    }

    @Test
    void testValidateToken_ValidToken() {
        String token = jwtService.generateToken("test@gms.com");

        boolean isValid = jwtService.validateToken(token, userDetails);

        assertTrue(isValid);
    }

    @Test
    void testValidateToken_InvalidUsername() {
        String token = jwtService.generateToken("another@gms.com");

        boolean isValid = jwtService.validateToken(token, userDetails);

        assertFalse(isValid);
    }

    @Test
    void testExtractExpiration() {
        String token = jwtService.generateToken("test@gms.com");

        assertDoesNotThrow(() -> {
            jwtService.extractUserName(token);
        });
    }
}
