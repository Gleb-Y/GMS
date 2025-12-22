package com.gyurt.gms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gyurt.gms.model.Membership;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.model.UserPrincipal;
import com.gyurt.gms.repo.MembershipRepository;
import com.gyurt.gms.service.MembershipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc@ActiveProfiles("test")class MembershipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MembershipRepository membershipRepository;

    @MockBean
    private MembershipService membershipService;

    private Membership testMembership;

    @BeforeEach
    void setUp() {
        testMembership = new Membership();
        testMembership.setId(1L);
        testMembership.setName("Standard");
        testMembership.setPrice(new BigDecimal("1000"));
        testMembership.setDurationDays(30);
        testMembership.setIsActive(true);
    }

    @Test
    void testGetAllMemberships() throws Exception {
        List<Membership> memberships = Arrays.asList(testMembership);
        when(membershipRepository.findAll()).thenReturn(memberships);

        mockMvc.perform(get("/api/memberships"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Standard"));
    }

    @Test
    void testGetActiveMemberships() throws Exception {
        List<Membership> memberships = Arrays.asList(testMembership);
        when(membershipRepository.findByIsActiveTrue()).thenReturn(memberships);

        mockMvc.perform(get("/api/memberships/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].isActive").value(true));
    }

    @Test
    void testGetMembershipById_Success() throws Exception {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));

        mockMvc.perform(get("/api/memberships/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Standard"));
    }

    @Test
    void testGetMembershipById_NotFound() throws Exception {
        when(membershipRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/memberships/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateMembership_Success() throws Exception {
        when(membershipRepository.existsByName(any())).thenReturn(false);
        when(membershipRepository.save(any(Membership.class))).thenReturn(testMembership);

        mockMvc.perform(post("/api/memberships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testMembership)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Standard"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateMembership_NameAlreadyExists() throws Exception {
        when(membershipRepository.existsByName("Standard")).thenReturn(true);

        mockMvc.perform(post("/api/memberships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testMembership)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateMembership_Success() throws Exception {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        when(membershipRepository.save(any(Membership.class))).thenReturn(testMembership);

        mockMvc.perform(put("/api/memberships/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testMembership)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteMembership_Success() throws Exception {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        doNothing().when(membershipRepository).delete(testMembership);

        mockMvc.perform(delete("/api/memberships/1"))
                .andExpect(status().isOk());
    }
}
