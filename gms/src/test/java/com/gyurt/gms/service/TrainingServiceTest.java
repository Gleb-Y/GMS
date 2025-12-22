package com.gyurt.gms.service;

import com.gyurt.gms.model.*;
import com.gyurt.gms.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainingServiceTest {

    @Mock
    private CoachRepository coachRepository;

    @Mock
    private TrainingScheduleRepository scheduleRepository;

    @Mock
    private TrainingBookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private TrainingService trainingService;

    private User testUser;
    private Coach testCoach;
    private TrainingSchedule testSchedule;
    private TrainingBooking testBooking;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@gms.com");

        testCoach = new Coach();
        testCoach.setId(1L);
        testCoach.setUser(testUser);
        testCoach.setSpecialization("Yoga");
        testCoach.setIsActive(true);

        testSchedule = new TrainingSchedule();
        testSchedule.setId(1L);
        testSchedule.setCoach(testCoach);
        testSchedule.setTrainingName("Morning Yoga");
        testSchedule.setStartTime(LocalDateTime.now().plusDays(1));
        testSchedule.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));
        testSchedule.setMaxCapacity(10);

        testBooking = new TrainingBooking();
        testBooking.setId(1L);
        testBooking.setUser(testUser);
        testBooking.setSchedule(testSchedule);
        testBooking.setIsCancelled(false);
    }

    @Test
    void testCreateCoach_Success() {
        when(coachRepository.save(any(Coach.class))).thenReturn(testCoach);

        Coach result = trainingService.createCoach(testUser, "Yoga", "Experienced yoga instructor");

        assertNotNull(result);
        assertEquals("Yoga", result.getSpecialization());
        assertTrue(result.getIsActive());
        verify(coachRepository).save(any(Coach.class));
    }

    @Test
    void testGetCoachByUser() {
        when(coachRepository.findByUser(testUser)).thenReturn(Optional.of(testCoach));

        Optional<Coach> result = trainingService.getCoachByUser(testUser);

        assertTrue(result.isPresent());
        assertEquals(testCoach, result.get());
    }

    @Test
    void testGetActiveCoaches() {
        List<Coach> coaches = Arrays.asList(testCoach);
        when(coachRepository.findAllActive()).thenReturn(coaches);

        List<Coach> result = trainingService.getActiveCoaches();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsActive());
    }

    @Test
    void testGetCoachesBySpecialization() {
        List<Coach> coaches = Arrays.asList(testCoach);
        when(coachRepository.findBySpecialization("Yoga")).thenReturn(coaches);

        List<Coach> result = trainingService.getCoachesBySpecialization("Yoga");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Yoga", result.get(0).getSpecialization());
    }

    @Test
    void testCreateSchedule_Success() {
        when(scheduleRepository.save(any(TrainingSchedule.class))).thenReturn(testSchedule);

        TrainingSchedule result = trainingService.createSchedule(
                testCoach,
                "Morning Yoga",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(1).plusHours(1),
                10
        );

        assertNotNull(result);
        assertEquals("Morning Yoga", result.getTrainingName());
        assertEquals(10, result.getMaxCapacity());
        verify(scheduleRepository).save(any(TrainingSchedule.class));
    }  

    @Test
    void testGetCoachSchedules() {
        List<TrainingSchedule> schedules = Arrays.asList(testSchedule);
        when(scheduleRepository.findCoachSchedules(testCoach)).thenReturn(schedules);

        List<TrainingSchedule> result = trainingService.getCoachSchedules(testCoach);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testCoach, result.get(0).getCoach());
    }

    @Test
    void testGetUpcomingSchedules() {
        List<TrainingSchedule> schedules = Arrays.asList(testSchedule);
        when(scheduleRepository.findUpcomingSchedules()).thenReturn(schedules);

        List<TrainingSchedule> result = trainingService.getUpcomingSchedules();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testUpdateSchedule_Success() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(scheduleRepository.save(any(TrainingSchedule.class))).thenReturn(testSchedule);

        TrainingSchedule result = trainingService.updateSchedule(
                1L,
                "Evening Yoga",
                LocalDateTime.now().plusDays(2),
                LocalDateTime.now().plusDays(2).plusHours(1),
                15
        );

        assertNotNull(result);
        verify(scheduleRepository).save(any(TrainingSchedule.class));
    }

    @Test
    void testDeleteSchedule_Success() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(scheduleRepository.save(any(TrainingSchedule.class))).thenReturn(testSchedule);

        trainingService.deleteSchedule(1L);

        verify(scheduleRepository).save(any(TrainingSchedule.class));
        // Verify that isActive was set to false (soft delete)
    }

    @Test
    void testBookTraining_Success() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(bookingRepository.findUserScheduleBooking(testUser, testSchedule)).thenReturn(Optional.empty());
        when(bookingRepository.countActiveBookings(testSchedule)).thenReturn(5);
        when(bookingRepository.save(any(TrainingBooking.class))).thenReturn(testBooking);

        TrainingBooking result = trainingService.bookTraining(testUser, 1L);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(testSchedule, result.getSchedule());
        verify(bookingRepository).save(any(TrainingBooking.class));
    }

    @Test
    void testBookTraining_ScheduleNotFound() {
        when(scheduleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            trainingService.bookTraining(testUser, 999L);
        });
    }

    @Test
    void testBookTraining_AlreadyBooked() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(bookingRepository.findUserScheduleBooking(testUser, testSchedule))
                .thenReturn(Optional.of(testBooking));

        assertThrows(IllegalStateException.class, () -> {
            trainingService.bookTraining(testUser, 1L);
        });
    }

    @Test
    void testBookTraining_ScheduleFull() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(bookingRepository.findUserScheduleBooking(testUser, testSchedule)).thenReturn(Optional.empty());
        when(bookingRepository.countActiveBookings(testSchedule)).thenReturn(10);

        assertThrows(IllegalStateException.class, () -> {
            trainingService.bookTraining(testUser, 1L);
        });
    }

    @Test
    void testCancelBooking_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(TrainingBooking.class))).thenReturn(testBooking);

        trainingService.cancelBooking(testUser, 1L);

        assertTrue(testBooking.getIsCancelled());
        verify(bookingRepository).save(any(TrainingBooking.class));
    }

    @Test
    void testCancelBooking_NotFound() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            trainingService.cancelBooking(testUser, 999L);
        });
    }

    @Test
    void testCancelBooking_NotOwnedByUser() {
        User anotherUser = new User();
        anotherUser.setId(2L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        assertThrows(IllegalStateException.class, () -> {
            trainingService.cancelBooking(anotherUser, 1L);
        });
    }

    @Test
    void testGetUserActiveBookings() {
        List<TrainingBooking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findUserActiveBookings(testUser)).thenReturn(bookings);

        List<TrainingBooking> result = trainingService.getUserActiveBookings(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertFalse(result.get(0).getIsCancelled());
    }

    @Test
    void testGetScheduleBookings() {
        List<TrainingBooking> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findScheduleBookings(testSchedule)).thenReturn(bookings);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));

        List<TrainingBooking> result = trainingService.getScheduleBookings(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetAvailableSpots() {
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        when(bookingRepository.countActiveBookings(testSchedule)).thenReturn(3);

        Integer availableSpots = trainingService.getAvailableSpots(1L);

        assertEquals(7, availableSpots);
    }
}
