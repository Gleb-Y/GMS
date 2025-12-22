package com.gyurt.gms.dto;

import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.repo.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMembershipDto {
    private Long id;
    
    // User info
    private Long userId;
    private String userEmail;
    private String userFullName;
    
    // Membership info
    private Long membershipId;
    private String membershipName;
    private BigDecimal membershipPrice;
    private Integer membershipDurationDays;
    private String membershipDescription;
    
    // UserMembership specific
    private LocalDate startDate;
    private LocalDate endDate;
    private MembershipStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Boolean isExpired;
    private Long daysRemaining;

    public UserMembershipDto(UserMembership userMembership) {
        this.id = userMembership.getId();
        
        // User info
        if (userMembership.getUser() != null) {
            this.userId = userMembership.getUser().getUserId();
            this.userEmail = userMembership.getUser().getEmail();
            this.userFullName = userMembership.getUser().getName();
        }
        
        // Membership info
        if (userMembership.getMembership() != null) {
            this.membershipId = userMembership.getMembership().getId();
            this.membershipName = userMembership.getMembership().getName();
            this.membershipPrice = userMembership.getMembership().getPrice();
            this.membershipDurationDays = userMembership.getMembership().getDurationDays();
            this.membershipDescription = userMembership.getMembership().getDescription();
        }
        
        // UserMembership specific
        this.startDate = userMembership.getStartDate();
        this.endDate = userMembership.getEndDate();
        this.status = userMembership.getStatus();
        this.notes = userMembership.getNotes();
        this.createdAt = userMembership.getCreatedAt();
        this.updatedAt = userMembership.getUpdatedAt();
        
        // Computed fields
        this.isExpired = userMembership.isExpired();
        this.daysRemaining = userMembership.getRemainingDays();
    }
}
