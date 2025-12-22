package com.gyurt.gms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gyurt.gms.dto.LoginResponse;
import com.gyurt.gms.model.User;
import com.gyurt.gms.repo.Role;
import com.gyurt.gms.repo.UserRepository;
import com.gyurt.gms.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc@ActiveProfiles("test")class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@gms.com");
        testUser.setName("Test User");
        testUser.setPassword("password123");
        testUser.setRole(Role.USER);
    }

    @Test
    void testCreateUser_Success() throws Exception {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Manually create JSON with password field since @JsonProperty(access = WRITE_ONLY) 
        // prevents password from being serialized by ObjectMapper
        String userJson = """
                {
                    "email": "test@gms.com",
                    "name": "Test User",
                    "password": "password123",
                    "role": "USER"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        verify(userRepository).save(any(User.class));
    }

    @Test
    void testCreateUser_EmailAlreadyExists() throws Exception {
        when(userRepository.existsByEmail(testUser.getEmail())).thenReturn(true);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isBadRequest());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserByEmail_Success() throws Exception {
        when(userRepository.findByEmail("test@gms.com")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/users/test@gms.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@gms.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserByEmail_NotFound() throws Exception {
        when(userRepository.findByEmail("notfound@gms.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/notfound@gms.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testLogin_Success() throws Exception {
        LoginResponse loginResponse = new LoginResponse("token123", "USER", "test@gms.com");
        when(userService.verify(any(User.class))).thenReturn(loginResponse);

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token123"));
    }

    @Test
    void testLogin_InvalidCredentials() throws Exception {
        when(userService.verify(any(User.class))).thenThrow(new RuntimeException("Authentication failed"));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteUser_Success() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk());

        verify(userRepository).delete(testUser);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteUser_NotFound() throws Exception {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/users/999"))
                .andExpect(status().isNotFound());
    }
}
