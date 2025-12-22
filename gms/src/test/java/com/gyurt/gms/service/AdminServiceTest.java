package com.gyurt.gms.service;

import com.gyurt.gms.model.User;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.repo.LockerRentRepository;
import com.gyurt.gms.repo.TrainingBookingRepository;
import com.gyurt.gms.repo.UserMembershipRepository;
import com.gyurt.gms.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMembershipRepository userMembershipRepository;

    @Mock
    private LockerRentRepository lockerRentRepository;

    @Mock
    private TrainingBookingRepository trainingBookingRepository;

    @InjectMocks
    private AdminService adminService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@gms.com");
        testUser.setName("Test User");
    }

    @Test
    void testDeleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        adminService.deleteUser(1L);

        verify(userRepository).findById(1L);
        verify(userRepository).delete(testUser);
    }

    @Test
    void testDeleteUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            adminService.deleteUser(999L);
        });

        verify(userRepository, never()).delete(any());
    }

    @Test
    void testGetAttendanceReport() {
        YearMonth month = YearMonth.of(2025, 12);
        when(userMembershipRepository.findAll()).thenReturn(Arrays.asList());
        when(lockerRentRepository.findAll()).thenReturn(Arrays.asList());
        when(trainingBookingRepository.findAll()).thenReturn(Arrays.asList());

        Map<String, Object> report = adminService.getAttendanceReport(month);

        assertNotNull(report);
        assertTrue(report.containsKey("month"));
        assertTrue(report.containsKey("active_memberships"));
        assertTrue(report.containsKey("new_memberships"));
        assertTrue(report.containsKey("locker_rents"));
        assertTrue(report.containsKey("training_bookings"));
        assertEquals("2025-12", report.get("month"));
    }

    @Test
    void testGetProgramPopularity() {
        when(trainingBookingRepository.findAll()).thenReturn(Arrays.asList());

        Map<String, Long> popularity = adminService.getProgramPopularity();

        assertNotNull(popularity);
        verify(trainingBookingRepository).findAll();
    }

    @Test
    void testGetMonthlyRevenue() {
        YearMonth month = YearMonth.of(2025, 12);
        when(userMembershipRepository.findAll()).thenReturn(Arrays.asList());

        BigDecimal revenue = adminService.getMonthlyRevenue(month);

        assertNotNull(revenue);
        assertEquals(BigDecimal.ZERO, revenue);
        verify(userMembershipRepository).findAll();
    }

    @Test
    void testGetUserStatistics() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));
        when(userMembershipRepository.findActiveByUserId(anyLong(), any())).thenReturn(Optional.empty());

        Map<String, Object> stats = adminService.getUserStatistics();

        assertNotNull(stats);
        assertTrue(stats.containsKey("total_users"));
        assertTrue(stats.containsKey("users_without_membership"));
        assertEquals(1, stats.get("total_users"));
    }

    @Test
    void testGetTopCoaches() {
        when(trainingBookingRepository.findAll()).thenReturn(Arrays.asList());

        Map<String, Long> topCoaches = adminService.getTopCoaches(5);

        assertNotNull(topCoaches);
        verify(trainingBookingRepository).findAll();
    }

    @Test
    void testGetUserMembershipInfo_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userMembershipRepository.findActiveByUserId(eq(1L), any())).thenReturn(Optional.empty());

        Map<String, Object> info = adminService.getUserMembershipInfo(1L);

        assertNotNull(info);
        assertTrue(info.containsKey("user_id"));
        assertTrue(info.containsKey("user_email"));
        assertEquals(1L, info.get("user_id"));
    }

    @Test
    void testGetUserMembershipInfo_UserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            adminService.getUserMembershipInfo(999L);
        });
    }
}
