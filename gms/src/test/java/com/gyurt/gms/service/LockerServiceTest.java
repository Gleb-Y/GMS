package com.gyurt.gms.service;

import com.gyurt.gms.model.Locker;
import com.gyurt.gms.model.LockerRent;
import com.gyurt.gms.model.User;
import com.gyurt.gms.repo.LockerRepository;
import com.gyurt.gms.repo.LockerRentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LockerServiceTest {

    @Mock
    private LockerRepository lockerRepository;

    @Mock
    private LockerRentRepository lockerRentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private LockerService lockerService;

    private User testUser;
    private Locker testLocker;
    private LockerRent testLockerRent;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@gms.com");

        testLocker = new Locker();
        testLocker.setId(1L);
        testLocker.setLockerNumber("LOCKER-001");
        testLocker.setIsAvailable(true);

        testLockerRent = new LockerRent();
        testLockerRent.setId(1L);
        testLockerRent.setUser(testUser);
        testLockerRent.setLocker(testLocker);
        testLockerRent.setRentDate(LocalDate.now());
        testLockerRent.setIsActive(true);
    }

    @Test
    void testGetAvailableLockers() {
        List<Locker> lockers = Arrays.asList(testLocker);
        when(lockerRepository.findAllAvailable()).thenReturn(lockers);

        List<com.gyurt.gms.dto.LockerDto> result = lockerService.getAvailableLockers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsAvailable());
        verify(lockerRepository).findAllAvailable();
    }

    @Test
    void testGetAvailableLockerCount() {
        when(lockerRepository.countAvailable()).thenReturn(50L);

        Long count = lockerService.getAvailableLockerCount();

        assertEquals(50L, count);
        verify(lockerRepository).countAvailable();
    }

    @Test
    void testRentLocker_Success() {
        when(lockerRentRepository.findActiveRentByUser(testUser)).thenReturn(Optional.empty());
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(testLocker));
        when(lockerRentRepository.save(any(LockerRent.class))).thenReturn(testLockerRent);
        when(lockerRepository.save(any(Locker.class))).thenReturn(testLocker);

        LockerRent result = lockerService.rentLocker(1L, testUser);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(testLocker, result.getLocker());
        assertFalse(testLocker.getIsAvailable());
        verify(lockerRentRepository).save(any(LockerRent.class));
        verify(lockerRepository).save(any(Locker.class));
    }

    @Test
    void testRentLocker_UserAlreadyHasActiveRent() {
        when(lockerRentRepository.findActiveRentByUser(testUser)).thenReturn(Optional.of(testLockerRent));

        assertThrows(IllegalStateException.class, () -> {
            lockerService.rentLocker(1L, testUser);
        });

        verify(lockerRentRepository, never()).save(any(LockerRent.class));
    }

    @Test
    void testRentLocker_LockerNotFound() {
        when(lockerRentRepository.findActiveRentByUser(testUser)).thenReturn(Optional.empty());
        when(lockerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            lockerService.rentLocker(999L, testUser);
        });
    }

    @Test
    void testRentLocker_LockerNotAvailable() {
        testLocker.setIsAvailable(false);
        when(lockerRentRepository.findActiveRentByUser(testUser)).thenReturn(Optional.empty());
        when(lockerRepository.findById(1L)).thenReturn(Optional.of(testLocker));

        assertThrows(IllegalStateException.class, () -> {
            lockerService.rentLocker(1L, testUser);
        });
    }

    @Test
    void testReleaseLocker_Success() {
        when(lockerRentRepository.findById(1L)).thenReturn(Optional.of(testLockerRent));
        when(lockerRentRepository.save(any(LockerRent.class))).thenReturn(testLockerRent);
        when(lockerRepository.save(any(Locker.class))).thenReturn(testLocker);

        lockerService.releaseLocker(1L, testUser);

        assertFalse(testLockerRent.getIsActive());
        assertNotNull(testLockerRent.getReleasedAt());
        assertTrue(testLocker.getIsAvailable());
        verify(lockerRentRepository).save(any(LockerRent.class));
        verify(lockerRepository).save(any(Locker.class));
    }

    @Test
    void testReleaseLocker_NotFound() {
        when(lockerRentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            lockerService.releaseLocker(999L, testUser);
        });
    }

    @Test
    void testReleaseLocker_NotOwnedByUser() {
        User anotherUser = new User();
        anotherUser.setId(2L);
        when(lockerRentRepository.findById(1L)).thenReturn(Optional.of(testLockerRent));

        assertThrows(IllegalStateException.class, () -> {
            lockerService.releaseLocker(1L, anotherUser);
        });
    }

    @Test
    void testReleaseLocker_AlreadyReleased() {
        testLockerRent.setIsActive(false);
        when(lockerRentRepository.findById(1L)).thenReturn(Optional.of(testLockerRent));

        assertThrows(IllegalStateException.class, () -> {
            lockerService.releaseLocker(1L, testUser);
        });
    }

    @Test
    void testGetUserActiveRent() {
        when(lockerRentRepository.findActiveRentByUser(testUser)).thenReturn(Optional.of(testLockerRent));

        Optional<LockerRent> result = lockerService.getUserActiveRent(testUser);

        assertTrue(result.isPresent());
        assertEquals(testLockerRent, result.get());
    }

    @Test
    void testGetUserRentHistory() {
        List<LockerRent> history = Arrays.asList(testLockerRent);
        when(lockerRentRepository.findUserRentHistory(testUser)).thenReturn(history);

        List<LockerRent> result = lockerService.getUserRentHistory(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(lockerRentRepository).findUserRentHistory(testUser);
    }
}
