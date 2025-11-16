package com.gyurt.gms.service;

import com.gyurt.gms.model.*;
import com.gyurt.gms.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingService {

    private final CoachRepository coachRepository;
    private final TrainingScheduleRepository scheduleRepository;
    private final TrainingBookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;


    @Transactional
    public Coach createCoach(User user, String specialization, String bio) {
        log.info("Creating coach profile for user {}", user.getId());

        if (coachRepository.findByUser(user).isPresent()) {
            throw new IllegalStateException("User already has a coach profile");
        }

        Coach coach = new Coach();
        coach.setUser(user);
        coach.setSpecialization(specialization);
        coach.setBio(bio);
        coach.setIsActive(true);

        Coach saved = coachRepository.save(coach);
        log.info("Coach profile created for user {}", user.getId());
        return saved;
    }


    public Optional<Coach> getCoachByUser(User user) {
        return coachRepository.findByUser(user);
    }


    @Cacheable(value = "active_coaches")
    public List<Coach> getActiveCoaches() {
        log.info("Fetching active coaches from database");
        return coachRepository.findAllActive();
    }


    @Cacheable(value = "coaches_by_specialization", key = "#specialization")
    public List<Coach> getCoachesBySpecialization(String specialization) {
        log.info("Fetching coaches with specialization: {}", specialization);
        return coachRepository.findBySpecialization(specialization);
    }

    @Transactional
    @CacheEvict(value = {"coach_schedules", "upcoming_schedules"}, allEntries = true)
    public TrainingSchedule createSchedule(Coach coach, String trainingName, LocalDateTime startTime, LocalDateTime endTime, Integer maxCapacity) {
        log.info("Creating training schedule for coach {}: {} from {} to {}", coach.getId(), trainingName, startTime, endTime);

        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        TrainingSchedule schedule = new TrainingSchedule();
        schedule.setCoach(coach);
        schedule.setTrainingName(trainingName);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setMaxCapacity(maxCapacity);
        schedule.setIsActive(true);

        TrainingSchedule saved = scheduleRepository.save(schedule);
        log.info("Training schedule created with ID {}", saved.getId());
        return saved;
    }


    @Cacheable(value = "coach_schedules", key = "#coach.id")
    public List<TrainingSchedule> getCoachSchedules(Coach coach) {
        log.info("Fetching schedules for coach {}", coach.getId());
        return scheduleRepository.findCoachSchedules(coach);
    }


    @Cacheable(value = "upcoming_schedules")
    public List<TrainingSchedule> getUpcomingSchedules() {
        log.info("Fetching upcoming schedules from database");
        return scheduleRepository.findUpcomingSchedules();
    }


    public TrainingSchedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Training schedule not found"));
    }


    @Transactional
    @CacheEvict(value = {"coach_schedules", "upcoming_schedules"}, allEntries = true)
    public TrainingSchedule updateSchedule(Long id, String trainingName, LocalDateTime startTime, LocalDateTime endTime, Integer maxCapacity) {
        log.info("Updating training schedule {}", id);

        TrainingSchedule schedule = getScheduleById(id);

        if (trainingName != null) schedule.setTrainingName(trainingName);
        if (startTime != null && endTime != null) {
            if (startTime.isAfter(endTime)) {
                throw new IllegalArgumentException("Start time must be before end time");
            }
            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);
        }
        if (maxCapacity != null) schedule.setMaxCapacity(maxCapacity);

        return scheduleRepository.save(schedule);
    }


    @Transactional
    @CacheEvict(value = {"coach_schedules", "upcoming_schedules"}, allEntries = true)
    public void deleteSchedule(Long id) {
        log.info("Deleting training schedule {}", id);
        TrainingSchedule schedule = getScheduleById(id);
        schedule.setIsActive(false);
        scheduleRepository.save(schedule);
    }

    @Transactional
    @CacheEvict(value = "user_bookings", key = "#user.id", allEntries = true)
    public TrainingBooking bookTraining(User user, Long scheduleId) {
        log.info("User {} booking training schedule {}", user.getId(), scheduleId);

        TrainingSchedule schedule = getScheduleById(scheduleId);

        // Проверить, не забронировал ли уже пользователь эту тренировку
        Optional<TrainingBooking> existingBooking = bookingRepository.findUserScheduleBooking(user, schedule);
        if (existingBooking.isPresent()) {
            throw new IllegalStateException("User already booked this training");
        }

        Integer currentBookings = bookingRepository.countActiveBookings(schedule);
        if (currentBookings >= schedule.getMaxCapacity()) {
            throw new IllegalStateException("Training is fully booked");
        }

        TrainingBooking booking = new TrainingBooking();
        booking.setUser(user);
        booking.setCoach(schedule.getCoach());
        booking.setSchedule(schedule);
        booking.setIsCancelled(false);

        TrainingBooking saved = bookingRepository.save(booking);
        log.info("User {} successfully booked training schedule {}", user.getId(), scheduleId);

        return saved;
    }


    @Transactional
    @CacheEvict(value = "user_bookings", key = "#user.id", allEntries = true)
    public void cancelBooking(User user, Long bookingId) {
        log.info("User {} cancelling booking {}", user.getId(), bookingId);

        TrainingBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("User can only cancel their own bookings");
        }

        if (booking.getIsCancelled()) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        booking.setIsCancelled(true);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        log.info("User {} successfully cancelled booking {}", user.getId(), bookingId);
    }


    @Cacheable(value = "user_bookings", key = "#user.id")
    public List<TrainingBooking> getUserActiveBookings(User user) {
        log.info("Fetching active bookings for user {}", user.getId());
        return bookingRepository.findUserActiveBookings(user);
    }


    public List<TrainingBooking> getScheduleBookings(Long scheduleId) {
        TrainingSchedule schedule = getScheduleById(scheduleId);
        return bookingRepository.findScheduleBookings(schedule);
    }

    public Integer getAvailableSpots(Long scheduleId) {
        TrainingSchedule schedule = getScheduleById(scheduleId);
        Integer bookedSpots = bookingRepository.countActiveBookings(schedule);
        return schedule.getMaxCapacity() - bookedSpots;
    }
}
