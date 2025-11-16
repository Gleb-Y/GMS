package com.gyurt.gms.controller;

import com.gyurt.gms.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "admin-controller", description = "Функции администратора")
public class AdminController {

    private final AdminService adminService;


    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Удалить клиента", description = "Только для администраторов")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        log.info("DELETE /api/admin/users/{}", userId);

        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/reports/attendance")
    @Operation(summary = "Получить отчёт посещаемости", description = "Только для администраторов")
    public ResponseEntity<?> getAttendanceReport(
            @RequestParam(required = false) String month) {
        log.info("GET /api/admin/reports/attendance - month: {}", month);

        try {
            YearMonth yearMonth = month != null ? YearMonth.parse(month) : YearMonth.now();
            Map<String, Object> report = adminService.getAttendanceReport(yearMonth);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating attendance report: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/reports/program-popularity")
    @Operation(summary = "Получить популярность программ", description = "Только для администраторов")
    public ResponseEntity<?> getProgramPopularity() {
        log.info("GET /api/admin/reports/program-popularity");

        try {
            Map<String, Long> popularity = adminService.getProgramPopularity();
            return ResponseEntity.ok(popularity);
        } catch (Exception e) {
            log.error("Error generating program popularity report: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/reports/monthly-revenue")
    @Operation(summary = "Получить месячную выручку", description = "Только для администраторов")
    public ResponseEntity<?> getMonthlyRevenue(
            @RequestParam(required = false) String month) {
        log.info("GET /api/admin/reports/monthly-revenue - month: {}", month);

        try {
            YearMonth yearMonth = month != null ? YearMonth.parse(month) : YearMonth.now();
            var revenue = adminService.getMonthlyRevenue(yearMonth);
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            log.error("Error calculating monthly revenue: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/reports/user-statistics")
    @Operation(summary = "Получить статистику пользователей", description = "Только для администраторов")
    public ResponseEntity<?> getUserStatistics() {
        log.info("GET /api/admin/reports/user-statistics");

        try {
            Map<String, Object> stats = adminService.getUserStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error generating user statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/reports/top-coaches")
    @Operation(summary = "Получить топ тренеров", description = "Только для администраторов")
    public ResponseEntity<?> getTopCoaches(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/admin/reports/top-coaches - limit: {}", limit);

        try {
            Map<String, Long> topCoaches = adminService.getTopCoaches(limit);
            return ResponseEntity.ok(topCoaches);
        } catch (Exception e) {
            log.error("Error fetching top coaches: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/users/{userId}/membership-info")
    @Operation(summary = "Получить информацию о членстве пользователя", description = "Только для администраторов")
    public ResponseEntity<?> getUserMembershipInfo(@PathVariable Long userId) {
        log.info("GET /api/admin/users/{}/membership-info", userId);

        try {
            Map<String, Object> info = adminService.getUserMembershipInfo(userId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Error fetching user membership info: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/dashboard")
    @Operation(summary = "Получить Dashboard с основными метриками", description = "Только для администраторов")
    public ResponseEntity<?> getDashboard() {
        log.info("GET /api/admin/dashboard");

        try {
            Map<String, Object> dashboard = Map.of(
                    "user_statistics", adminService.getUserStatistics(),
                    "attendance_report", adminService.getAttendanceReport(YearMonth.now()),
                    "program_popularity", adminService.getProgramPopularity(),
                    "monthly_revenue", adminService.getMonthlyRevenue(YearMonth.now()),
                    "top_coaches", adminService.getTopCoaches(5)
            );
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("Error generating dashboard: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
