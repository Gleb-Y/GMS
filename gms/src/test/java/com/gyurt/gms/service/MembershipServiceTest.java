package com.gyurt.gms.service;

import com.gyurt.gms.dto.UserMembershipDto;
import com.gyurt.gms.model.Membership;
import com.gyurt.gms.model.User;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.repo.MembershipRepository;
import com.gyurt.gms.repo.MembershipStatus;
import com.gyurt.gms.repo.NotificationRepository;
import com.gyurt.gms.repo.UserMembershipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private UserMembershipRepository userMembershipRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private MembershipService membershipService;

    private User testUser;
    private Membership testMembership;
    private UserMembership testUserMembership;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@gms.com");
        testUser.setName("Test User");

        testMembership = new Membership();
        testMembership.setId(1L);
        testMembership.setName("Standard");
        testMembership.setPrice(new BigDecimal("1000"));
        testMembership.setDurationDays(30);
        testMembership.setIsActive(true);

        testUserMembership = new UserMembership();
        testUserMembership.setId(1L);
        testUserMembership.setUser(testUser);
        testUserMembership.setMembership(testMembership);
        testUserMembership.setStartDate(LocalDate.now());
        testUserMembership.setEndDate(LocalDate.now().plusDays(30));
        testUserMembership.setStatus(MembershipStatus.ACTIVE);
    }

    @Test
    void testGetActiveMemberships() {
        List<Membership> memberships = Arrays.asList(testMembership);
        when(membershipRepository.findByIsActiveTrue()).thenReturn(memberships);

        List<Membership> result = membershipService.getActiveMemberships();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(membershipRepository).findByIsActiveTrue();
    }

    @Test
    void testGetMembershipById_Success() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));

        Membership result = membershipService.getMembershipById(1L);

        assertNotNull(result);
        assertEquals("Standard", result.getName());
        verify(membershipRepository).findById(1L);
    }

    @Test
    void testGetMembershipById_NotFound() {
        when(membershipRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            membershipService.getMembershipById(999L);
        });
    }

    @Test
    void testPurchaseMembership_Success() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        when(userMembershipRepository.save(any(UserMembership.class))).thenReturn(testUserMembership);

        UserMembership result = membershipService.purchaseMembership(testUser, 1L);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(testMembership, result.getMembership());
        verify(userMembershipRepository).save(any(UserMembership.class));
    }

    @Test
    void testPurchaseMembership_MembershipNotFound() {
        when(membershipRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            membershipService.purchaseMembership(testUser, 999L);
        });
    }

    @Test
    void testRenewMembership_Success() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserMembership));
        when(userMembershipRepository.save(any(UserMembership.class))).thenReturn(testUserMembership);

        UserMembership result = membershipService.renewMembership(testUser, 1L);

        assertNotNull(result);
        verify(userMembershipRepository, atLeastOnce()).save(any(UserMembership.class));
    }

    @Test
    void testRenewMembership_NoActiveMembership() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> {
            membershipService.renewMembership(testUser, 1L);
        });
    }

    @Test
    void testFreezeMembership_Success() {
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserMembership));
        when(userMembershipRepository.save(any(UserMembership.class))).thenReturn(testUserMembership);

        UserMembership result = membershipService.freezeMembership(testUser);

        assertNotNull(result);
        assertEquals(MembershipStatus.SUSPENDED, result.getStatus());
        verify(userMembershipRepository).save(any(UserMembership.class));
    }

    @Test
    void testFreezeMembership_NoActiveMembership() {
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> {
            membershipService.freezeMembership(testUser);
        });
    }

    @Test
    void testFreezeMembership_AlreadyFrozen() {
        testUserMembership.setStatus(MembershipStatus.SUSPENDED);
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserMembership));

        assertThrows(IllegalStateException.class, () -> {
            membershipService.freezeMembership(testUser);
        });
    }

    @Test
    void testUnfreezeMembership_Success() {
        testUserMembership.setStatus(MembershipStatus.SUSPENDED);
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserMembership));
        when(userMembershipRepository.save(any(UserMembership.class))).thenReturn(testUserMembership);

        UserMembership result = membershipService.unfreezeMembership(testUser);

        assertNotNull(result);
        assertEquals(MembershipStatus.ACTIVE, result.getStatus());
        verify(userMembershipRepository).save(any(UserMembership.class));
    }

    @Test
    void testUnfreezeMembership_NotFrozen() {
        testUserMembership.setStatus(MembershipStatus.ACTIVE);
        when(userMembershipRepository.findActiveByUserId(anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUserMembership));

        assertThrows(IllegalStateException.class, () -> {
            membershipService.unfreezeMembership(testUser);
        });
    }

    @Test
    void testGetUserMemberships() {
        List<UserMembership> memberships = Arrays.asList(testUserMembership);
        when(userMembershipRepository.findByUserId(anyLong())).thenReturn(memberships);

        List<UserMembership> result = membershipService.getUserMemberships(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userMembershipRepository).findByUserId(anyLong());
    }

    @Test
    void testCreateMembership() {
        when(membershipRepository.save(any(Membership.class))).thenReturn(testMembership);

        Membership result = membershipService.createMembership(testMembership);

        assertNotNull(result);
        assertEquals("Standard", result.getName());
        verify(membershipRepository).save(testMembership);
    }

    @Test
    void testUpdateMembership_Success() {
        Membership updates = new Membership();
        updates.setName("Premium");
        updates.setPrice(new BigDecimal("2000"));

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(testMembership));
        when(membershipRepository.save(any(Membership.class))).thenReturn(testMembership);

        Membership result = membershipService.updateMembership(1L, updates);

        assertNotNull(result);
        verify(membershipRepository).save(any(Membership.class));
    }

    @Test
    void testGetMembershipsExpiringIn() {
        List<UserMembership> memberships = Arrays.asList(testUserMembership);
        when(userMembershipRepository.findExpiringBefore(any(LocalDate.class))).thenReturn(memberships);

        List<UserMembership> result = membershipService.getMembershipsExpiringIn(7);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userMembershipRepository).findExpiringBefore(any(LocalDate.class));
    }
}
