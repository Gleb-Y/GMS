package com.gyurt.gms.controller;

import com.gyurt.gms.model.LockerRent;
import com.gyurt.gms.model.UserPrincipal;
import com.gyurt.gms.service.LockerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lockers")
@RequiredArgsConstructor
@Slf4j
public class LockerController {

    private final LockerService lockerService;


    @GetMapping("/available")
    public ResponseEntity<?> getAvailableLockers() {
        log.info("GET /api/lockers/available");
        return ResponseEntity.ok(lockerService.getAvailableLockers());
    }


    @GetMapping("/available/count")
    public ResponseEntity<?> getAvailableLockerCount() {
        log.info("GET /api/lockers/available/count");
        return ResponseEntity.ok(lockerService.getAvailableLockerCount());
    }


    @PostMapping("/rent/{lockerId}")
    public ResponseEntity<?> rentLocker(
            @PathVariable Long lockerId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/lockers/rent/{} - User: {}", lockerId, userPrincipal.getId());

        try {
            LockerRent rent = lockerService.rentLocker(lockerId, userPrincipal.getUser());
            return ResponseEntity.ok(rent);
        } catch (Exception e) {
            log.error("Error renting locker: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/release/{rentId}")
    public ResponseEntity<?> releaseLocker(
            @PathVariable Long rentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("POST /api/lockers/release/{} - User: {}", rentId, userPrincipal.getId());

        try {
            lockerService.releaseLocker(rentId, userPrincipal.getUser());
            return ResponseEntity.ok("Locker released successfully");
        } catch (Exception e) {
            log.error("Error releasing locker: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/my-rent")
    public ResponseEntity<?> getMyActiveRent(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("GET /api/lockers/my-rent - User: {}", userPrincipal.getId());

        return ResponseEntity.ok(lockerService.getUserActiveRent(userPrincipal.getUser()));
    }


    @GetMapping("/my-history")
    public ResponseEntity<?> getMyRentHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("GET /api/lockers/my-history - User: {}", userPrincipal.getId());

        List<LockerRent> history = lockerService.getUserRentHistory(userPrincipal.getUser());
        return ResponseEntity.ok(history);
    }
}
