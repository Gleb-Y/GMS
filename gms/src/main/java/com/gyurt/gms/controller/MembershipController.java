package com.gyurt.gms.controller;

import com.gyurt.gms.dto.ApiResponse;
import com.gyurt.gms.model.Membership;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.model.UserPrincipal;
import com.gyurt.gms.repo.MembershipRepository;
import com.gyurt.gms.service.MembershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "membership-controller", description = "Управление типами абонементов")
public class MembershipController {

    private final MembershipRepository membershipRepository;
    private final MembershipService membershipService;

    @GetMapping
    @Operation(summary = "Получить все абонементы", description = "Доступно для всех пользователей")
    public ResponseEntity<ApiResponse<List<Membership>>> getAllMemberships() {
        List<Membership> memberships = membershipRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(memberships, "Memberships retrieved successfully"));
    }

    @GetMapping("/active")
    @Operation(summary = "Получить активные абонементы")
    public ResponseEntity<ApiResponse<List<Membership>>> getActiveMemberships() {
        List<Membership> memberships = membershipRepository.findByIsActiveTrue();
        return ResponseEntity.ok(ApiResponse.success(memberships, "Active memberships retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить абонемент по ID")
    public ResponseEntity<ApiResponse<Membership>> getMembershipById(@PathVariable Long id) {
        return membershipRepository.findById(id)
            .map(membership -> ResponseEntity.ok(ApiResponse.success(membership, "Membership found")))
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Создать новый тип абонемента", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<Membership>> createMembership(@Valid @RequestBody Membership membership) {
        try {
            if (membershipRepository.existsByName(membership.getName())) {
                return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Membership with this name already exists", HttpStatus.BAD_REQUEST.value()));
            }
            Membership savedMembership = membershipRepository.save(membership);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(savedMembership, "Membership created successfully"));
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Error creating membership: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Обновить абонемент", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<Membership>> updateMembership(
            @PathVariable Long id,
            @Valid @RequestBody Membership membership) {
        return membershipRepository.findById(id)
            .map(existingMembership -> {
                membership.setId(id);
                membership.setCreatedAt(existingMembership.getCreatedAt());
                Membership updatedMembership = membershipRepository.save(membership);
                return ResponseEntity.ok(ApiResponse.success(updatedMembership, "Membership updated successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Удалить абонемент", description = "Только для администраторов")
    public ResponseEntity<ApiResponse<Void>> deleteMembership(@PathVariable Long id) {
        return membershipRepository.findById(id)
            .map(membership -> {
                membershipRepository.delete(membership);
                return ResponseEntity.<ApiResponse<Void>>ok(ApiResponse.success(null, "Membership deleted successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .<ApiResponse<Void>>status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Membership not found with id: " + id, HttpStatus.NOT_FOUND.value())));
    }


    @PostMapping("/purchase/{membershipId}")
    @Operation(summary = "Купить абонемент", description = "Пользователь может купить абонемент")
    public ResponseEntity<?> purchaseMembership(
            @PathVariable Long membershipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/memberships/purchase/{} - User: {}", membershipId, userPrincipal.getId());

        try {
            UserMembership userMembership = membershipService.purchaseMembership(userPrincipal.getUser(), membershipId);
            return ResponseEntity.ok(ApiResponse.success(userMembership, "Membership purchased successfully"));
        } catch (Exception e) {
            log.error("Error purchasing membership: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }


    @PostMapping("/renew/{membershipId}")
    @Operation(summary = "Продлить абонемент", description = "Пользователь может продлить свой абонемент")
    public ResponseEntity<?> renewMembership(
            @PathVariable Long membershipId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/memberships/renew/{} - User: {}", membershipId, userPrincipal.getId());

        try {
            UserMembership userMembership = membershipService.renewMembership(userPrincipal.getUser(), membershipId);
            return ResponseEntity.ok(ApiResponse.success(userMembership, "Membership renewed successfully"));
        } catch (Exception e) {
            log.error("Error renewing membership: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }


    @PostMapping("/freeze")
    @Operation(summary = "Заморозить абонемент", description = "Пользователь может заморозить свой абонемент")
    public ResponseEntity<?> freezeMembership(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/memberships/freeze - User: {}", userPrincipal.getId());

        try {
            UserMembership userMembership = membershipService.freezeMembership(userPrincipal.getUser());
            return ResponseEntity.ok(ApiResponse.success(userMembership, "Membership frozen successfully"));
        } catch (Exception e) {
            log.error("Error freezing membership: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }


    @PostMapping("/unfreeze")
    @Operation(summary = "Разморозить абонемент", description = "Пользователь может разморозить свой абонемент")
    public ResponseEntity<?> unfreezeMembership(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/memberships/unfreeze - User: {}", userPrincipal.getId());

        try {
            UserMembership userMembership = membershipService.unfreezeMembership(userPrincipal.getUser());
            return ResponseEntity.ok(ApiResponse.success(userMembership, "Membership unfrozen successfully"));
        } catch (Exception e) {
            log.error("Error unfreezing membership: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }


    @GetMapping("/my-membership")
    @Operation(summary = "Получить мой активный абонемент")
    public ResponseEntity<?> getMyMembership(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("GET /api/memberships/my-membership - User: {}", userPrincipal.getId());

        var membership = membershipService.getUserActiveMembership(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success(membership, "Active membership retrieved"));
    }


    @GetMapping("/my-memberships")
    @Operation(summary = "Получить все мои абонементы")
    public ResponseEntity<?> getMyMemberships(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("GET /api/memberships/my-memberships - User: {}", userPrincipal.getId());

        List<UserMembership> memberships = membershipService.getUserMemberships(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success(memberships, "User memberships retrieved"));
    }
}
