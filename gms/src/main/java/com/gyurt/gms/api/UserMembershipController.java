package com.gyurt.gms.api;

import com.gyurt.gms.dto.ApiResponse;
import com.gyurt.gms.repo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/user-memberships")
@RequiredArgsConstructor
@Tag(name = "user-membership-controller", description = "Управление абонементами пользователей")
public class UserMembershipController {

    private final UserMembershipRepository userMembershipRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Получить все абонементы пользователя")
    public ResponseEntity<ApiResponse<List<UserMembership>>> getUserMemberships(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found with id: " + userId, HttpStatus.NOT_FOUND.value()));
        }
        List<UserMembership> memberships = userMembershipRepository.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(memberships, "User memberships retrieved successfully"));
    }

    @GetMapping("/user/{userId}/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Получить активный абонемент пользователя")
    public ResponseEntity<ApiResponse<UserMembership>> getActiveUserMembership(@PathVariable Long userId) {
        return userMembershipRepository.findActiveByUserId(userId, LocalDate.now())
            .map(membership -> ResponseEntity.ok(ApiResponse.success(membership, "Active membership found")))
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("No active membership found for user", HttpStatus.NOT_FOUND.value())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Получить абонемент по ID")
    public ResponseEntity<ApiResponse<UserMembership>> getUserMembershipById(@PathVariable Long id) {
        return userMembershipRepository.findById(id)
            .map(membership -> ResponseEntity.ok(ApiResponse.success(membership, "User membership found")))
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Назначить абонемент пользователю", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<UserMembership>> assignMembership(@Valid @RequestBody UserMembership userMembership) {
        try {
            // Проверка существования пользователя
            if (!userRepository.existsById(userMembership.getUser().getId())) {
                return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("User not found", HttpStatus.BAD_REQUEST.value()));
            }

            // Проверка существования типа абонемента
            if (!membershipRepository.existsById(userMembership.getMembership().getId())) {
                return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Membership not found", HttpStatus.BAD_REQUEST.value()));
            }

            // Автоматически рассчитываем end_date если не указан
            if (userMembership.getEndDate() == null && userMembership.getStartDate() != null) {
                Membership membership = membershipRepository.findById(userMembership.getMembership().getId()).orElseThrow();
                userMembership.setEndDate(userMembership.getStartDate().plusDays(membership.getDurationDays()));
            }

            UserMembership savedMembership = userMembershipRepository.save(userMembership);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(savedMembership, "Membership assigned successfully"));
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Error assigning membership: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Обновить абонемент пользователя", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<UserMembership>> updateUserMembership(
            @PathVariable Long id,
            @Valid @RequestBody UserMembership userMembership) {
        return userMembershipRepository.findById(id)
            .map(existingMembership -> {
                userMembership.setId(id);
                userMembership.setCreatedAt(existingMembership.getCreatedAt());
                UserMembership updatedMembership = userMembershipRepository.save(userMembership);
                return ResponseEntity.ok(ApiResponse.success(updatedMembership, "User membership updated successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Отменить абонемент", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<UserMembership>> cancelMembership(@PathVariable Long id) {
        return userMembershipRepository.findById(id)
            .map(membership -> {
                membership.setStatus(MembershipStatus.CANCELLED);
                UserMembership updatedMembership = userMembershipRepository.save(membership);
                return ResponseEntity.ok(ApiResponse.success(updatedMembership, "Membership cancelled successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Удалить абонемент пользователя", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<Void>> deleteUserMembership(@PathVariable Long id) {
        return userMembershipRepository.findById(id)
            .map(membership -> {
                userMembershipRepository.delete(membership);
                return ResponseEntity.<ApiResponse<Void>>ok(ApiResponse.success(null, "User membership deleted successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .<ApiResponse<Void>>status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Получить истекшие абонементы", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<List<UserMembership>>> getExpiredMemberships() {
        List<UserMembership> expiredMemberships = userMembershipRepository.findExpiredMemberships(LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success(expiredMemberships, "Expired memberships retrieved successfully"));
    }
}
