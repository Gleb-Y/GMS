package com.gyurt.gms.controller;

import com.gyurt.gms.model.*;
import com.gyurt.gms.service.TrainingService;
import com.gyurt.gms.repo.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "training-controller", description = "Управление тренировками и расписанием")
public class TrainingController {

    private final TrainingService trainingService;
    private final UserRepository userRepository;

    @GetMapping("/coaches")
    @Operation(summary = "Получить всех активных тренеров")
    public ResponseEntity<?> getActiveCoaches() {
        log.info("GET /api/trainings/coaches");
        List<Coach> coaches = trainingService.getActiveCoaches();
        return ResponseEntity.ok(coaches);
    }


    @GetMapping("/coaches/specialization/{specialization}")
    @Operation(summary = "Получить тренеров по специализации")
    public ResponseEntity<?> getCoachesBySpecialization(@PathVariable String specialization) {
        log.info("GET /api/trainings/coaches/specialization/{}", specialization);
        List<Coach> coaches = trainingService.getCoachesBySpecialization(specialization);
        return ResponseEntity.ok(coaches);
    }


    @PostMapping("/coaches/create")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Создать профиль тренера", description = "Только для администраторов")
    public ResponseEntity<?> createCoach(
            @RequestParam Long userId,
            @RequestParam String specialization,
            @RequestParam(required = false) String bio) {
        log.info("POST /api/trainings/coaches/create - userId: {}", userId);

        try {
            // Здесь нужно получить User по ID
            // Предполагается, что UserRepository доступен через сервис
            User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            Coach coach = trainingService.createCoach(user, specialization, bio);
            return ResponseEntity.status(HttpStatus.CREATED).body(coach);
        } catch (Exception e) {
            log.error("Error creating coach: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/schedules/coach/{coachId}")
    @Operation(summary = "Получить расписание тренера")
    public ResponseEntity<?> getCoachSchedules(@PathVariable Long coachId) {
        log.info("GET /api/trainings/schedules/coach/{}", coachId);

        try {
            Coach coach = new Coach();
            coach.setId(coachId);
            List<TrainingSchedule> schedules = trainingService.getCoachSchedules(coach);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            log.error("Error fetching coach schedules: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/schedules/upcoming")
    @Operation(summary = "Получить предстоящие тренировки")
    public ResponseEntity<?> getUpcomingSchedules() {
        log.info("GET /api/trainings/schedules/upcoming");
        List<TrainingSchedule> schedules = trainingService.getUpcomingSchedules();
        return ResponseEntity.ok(schedules);
    }


    @PostMapping("/schedules/create")
    @PreAuthorize("hasRole('COACH')")
    @Operation(summary = "Создать расписание тренировки", description = "Только для тренеров")
    public ResponseEntity<?> createSchedule(
            @RequestParam String trainingName,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam(defaultValue = "10") Integer maxCapacity,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/trainings/schedules/create - Coach: {}", userPrincipal.getId());

        try {
            Coach coach = trainingService.getCoachByUser(userPrincipal.getUser())
                    .orElseThrow(() -> new IllegalStateException("User is not a coach"));

            TrainingSchedule schedule = trainingService.createSchedule(coach, trainingName, startTime, endTime, maxCapacity);
            return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
        } catch (Exception e) {
            log.error("Error creating schedule: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasRole('COACH')")
    @Operation(summary = "Обновить расписание тренировки", description = "Только для тренеров")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestParam(required = false) String trainingName,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime,
            @RequestParam(required = false) Integer maxCapacity,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("PUT /api/trainings/schedules/{} - Coach: {}", scheduleId, userPrincipal.getId());

        try {
            TrainingSchedule schedule = trainingService.updateSchedule(scheduleId, trainingName, startTime, endTime, maxCapacity);
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            log.error("Error updating schedule: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasRole('COACH')")
    @Operation(summary = "Удалить расписание тренировки", description = "Только для тренеров")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("DELETE /api/trainings/schedules/{} - Coach: {}", scheduleId, userPrincipal.getId());

        try {
            trainingService.deleteSchedule(scheduleId);
            return ResponseEntity.ok("Schedule deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting schedule: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/bookings/book/{scheduleId}")
    @Operation(summary = "Забронировать место на тренировку")
    public ResponseEntity<?> bookTraining(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/trainings/bookings/book/{} - User: {}", scheduleId, userPrincipal.getId());

        try {
            TrainingBooking booking = trainingService.bookTraining(userPrincipal.getUser(), scheduleId);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (Exception e) {
            log.error("Error booking training: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/bookings/cancel/{bookingId}")
    @Operation(summary = "Отменить бронь на тренировку")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/trainings/bookings/cancel/{} - User: {}", bookingId, userPrincipal.getId());

        try {
            trainingService.cancelBooking(userPrincipal.getUser(), bookingId);
            return ResponseEntity.ok("Booking cancelled successfully");
        } catch (Exception e) {
            log.error("Error cancelling booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/bookings/my-bookings")
    @Operation(summary = "Получить мои активные бронирования")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("GET /api/trainings/bookings/my-bookings - User: {}", userPrincipal.getId());

        List<TrainingBooking> bookings = trainingService.getUserActiveBookings(userPrincipal.getUser());
        return ResponseEntity.ok(bookings);
    }


    @GetMapping("/bookings/schedule/{scheduleId}")
    @PreAuthorize("hasRole('COACH')")
    @Operation(summary = "Получить бронирования для расписания", description = "Только для тренеров")
    public ResponseEntity<?> getScheduleBookings(@PathVariable Long scheduleId) {
        log.info("GET /api/trainings/bookings/schedule/{}", scheduleId);

        try {
            List<TrainingBooking> bookings = trainingService.getScheduleBookings(scheduleId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            log.error("Error fetching schedule bookings: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/schedules/{scheduleId}/available-spots")
    @Operation(summary = "Получить количество свободных мест на тренировку")
    public ResponseEntity<?> getAvailableSpots(@PathVariable Long scheduleId) {
        log.info("GET /api/trainings/schedules/{}/available-spots", scheduleId);

        try {
            Integer availableSpots = trainingService.getAvailableSpots(scheduleId);
            return ResponseEntity.ok(availableSpots);
        } catch (Exception e) {
            log.error("Error fetching available spots: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
