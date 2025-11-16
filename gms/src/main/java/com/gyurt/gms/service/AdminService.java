package com.gyurt.gms.service;

import com.gyurt.gms.model.User;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.repo.UserRepository;
import com.gyurt.gms.repo.UserMembershipRepository;
import com.gyurt.gms.repo.LockerRentRepository;
import com.gyurt.gms.repo.TrainingBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final LockerRentRepository lockerRentRepository;
    private final TrainingBookingRepository trainingBookingRepository;


    @Transactional
    public void deleteUser(Long userId) {
        log.info("Admin deleting user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        userRepository.delete(user);

        log.info("User {} successfully deleted", userId);
    }


    public Map<String, Object> getAttendanceReport(YearMonth month) {
        log.info("Generating attendance report for {}", month);

        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        Map<String, Object> report = new HashMap<>();
        report.put("month", month.toString());

        List<UserMembership> activeMemberships = userMembershipRepository.findAll().stream()
                .filter(m -> !m.getStartDate().isAfter(endDate) && !m.getEndDate().isBefore(startDate))
                .toList();

        report.put("active_memberships", activeMemberships.size());

        long newMemberships = activeMemberships.stream()
                .filter(m -> m.getStartDate().isAfter(startDate.minusDays(1)) && m.getStartDate().isBefore(endDate.plusDays(1)))
                .count();

        report.put("new_memberships", newMemberships);

        long lockerRents = lockerRentRepository.findAll().stream()
                .filter(r -> !r.getRentDate().isBefore(startDate) && !r.getRentDate().isAfter(endDate))
                .count();

        report.put("locker_rents", lockerRents);

        long trainingBookings = trainingBookingRepository.findAll().stream()
                .filter(b -> !b.getCreatedAt().toLocalDate().isBefore(startDate) && !b.getCreatedAt().toLocalDate().isAfter(endDate))
                .count();

        report.put("training_bookings", trainingBookings);

        return report;
    }


    public Map<String, Long> getProgramPopularity() {
        log.info("Generating program popularity report");

        Map<String, Long> popularity = new HashMap<>();

        trainingBookingRepository.findAll().stream()
                .filter(b -> !b.getIsCancelled())
                .forEach(b -> {
                    String trainingName = b.getSchedule().getTrainingName();
                    popularity.put(trainingName, popularity.getOrDefault(trainingName, 0L) + 1);
                });

        return popularity;
    }


    public BigDecimal getMonthlyRevenue(YearMonth month) {
        log.info("Calculating monthly revenue for {}", month);

        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        BigDecimal revenue = userMembershipRepository.findAll().stream()
                .filter(m -> !m.getStartDate().isBefore(startDate) && !m.getStartDate().isAfter(endDate))
                .map(m -> m.getMembership().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Monthly revenue for {}: {}", month, revenue);
        return revenue;
    }


    public Map<String, Object> getUserStatistics() {
        log.info("Generating user statistics");

        Map<String, Object> stats = new HashMap<>();

        List<User> allUsers = userRepository.findAll();
        stats.put("total_users", allUsers.size());

        long usersWithActiveMembership = allUsers.stream()
                .filter(u -> userMembershipRepository.findActiveByUserId(u.getUserId(), LocalDate.now()).isPresent())
                .count();

        stats.put("users_with_active_membership", usersWithActiveMembership);

        long usersWithoutMembership = allUsers.size() - usersWithActiveMembership;
        stats.put("users_without_membership", usersWithoutMembership);

        return stats;
    }
    public Map<String, Long> getTopCoaches(int limit) {
        log.info("Getting top {} coaches", limit);

        Map<String, Long> topCoaches = new HashMap<>();

        trainingBookingRepository.findAll().stream()
                .filter(b -> !b.getIsCancelled())
                .forEach(b -> {
                    String coachName = b.getCoach().getUser().getName();
                    topCoaches.put(coachName, topCoaches.getOrDefault(coachName, 0L) + 1);
                });

        return topCoaches.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .collect(HashMap::new, (m, e) -> m.put(e.getKey(), e.getValue()), HashMap::putAll);
    }


    public Map<String, Object> getUserMembershipInfo(Long userId) {
        log.info("Getting membership info for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> info = new HashMap<>();
        info.put("user_id", user.getId());
        info.put("user_name", user.getName());
        info.put("user_email", user.getEmail());

        userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now()).ifPresentOrElse(
                membership -> {
                    info.put("has_active_membership", true);
                    info.put("membership_name", membership.getMembership().getName());
                    info.put("membership_start", membership.getStartDate());
                    info.put("membership_end", membership.getEndDate());
                    info.put("membership_status", membership.getStatus());
                    info.put("remaining_days", membership.getRemainingDays());
                },
                () -> info.put("has_active_membership", false)
        );

        return info;
    }
}
