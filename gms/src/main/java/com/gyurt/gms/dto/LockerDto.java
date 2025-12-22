package com.gyurt.gms.dto;

import com.gyurt.gms.model.Locker;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LockerDto {
    private Long id;
    private String lockerNumber;
    private Boolean isAvailable;
    private Long currentUserId;
    private String currentUserEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LockerDto(Locker locker) {
        this.id = locker.getId();
        this.lockerNumber = locker.getLockerNumber();
        this.isAvailable = locker.getIsAvailable();
        if (locker.getCurrentUser() != null) {
            this.currentUserId = locker.getCurrentUser().getUserId();
            this.currentUserEmail = locker.getCurrentUser().getEmail();
        }
        this.createdAt = locker.getCreatedAt();
        this.updatedAt = locker.getUpdatedAt();
    }
}
