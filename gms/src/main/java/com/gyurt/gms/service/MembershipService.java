package com.gyurt.gms.service;

import com.gyurt.gms.model.Membership;
import com.gyurt.gms.model.Notification;
import com.gyurt.gms.model.User;
import com.gyurt.gms.model.UserMembership;
import com.gyurt.gms.repo.MembershipRepository;
import com.gyurt.gms.repo.MembershipStatus;
import com.gyurt.gms.repo.UserMembershipRepository;
import com.gyurt.gms.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final NotificationRepository notificationRepository;


    @Cacheable(value = "active_memberships")
    public List<Membership> getActiveMemberships() {
        log.info("Fetching active memberships from database");
        return membershipRepository.findByIsActiveTrue();
    }


    public Membership getMembershipById(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
    }


    @Transactional
    @CacheEvict(value = "user_active_membership", key = "#user.id", allEntries = true)
    public UserMembership purchaseMembership(User user, Long membershipId) {
        log.info("User {} purchasing membership {}", user.getId(), membershipId);

        Membership membership = getMembershipById(membershipId);

        Optional<UserMembership> existingMembership = userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now());
        if (existingMembership.isPresent()) {
            throw new IllegalStateException("User already has an active membership");
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(membership.getDurationDays());

        UserMembership userMembership = new UserMembership();
        userMembership.setUser(user);
        userMembership.setMembership(membership);
        userMembership.setStartDate(startDate);
        userMembership.setEndDate(endDate);
        userMembership.setStatus(MembershipStatus.ACTIVE);
        userMembership.setNotes("Purchased on " + startDate);

        UserMembership saved = userMembershipRepository.save(userMembership);
        log.info("User {} successfully purchased membership {} (expires: {})", user.getId(), membershipId, endDate);

        return saved;
    }

    @Transactional
    @CacheEvict(value = "user_active_membership", key = "#user.id", allEntries = true)
    public UserMembership renewMembership(User user, Long membershipId) {
        log.info("User {} renewing membership {}", user.getId(), membershipId);

        Membership membership = getMembershipById(membershipId);

        UserMembership currentMembership = userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now())
                .orElseThrow(() -> new IllegalStateException("User has no active membership to renew"));

        currentMembership.setStatus(MembershipStatus.EXPIRED);
        userMembershipRepository.save(currentMembership);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(membership.getDurationDays());

        UserMembership newMembership = new UserMembership();
        newMembership.setUser(user);
        newMembership.setMembership(membership);
        newMembership.setStartDate(startDate);
        newMembership.setEndDate(endDate);
        newMembership.setStatus(MembershipStatus.ACTIVE);
        newMembership.setNotes("Renewed on " + startDate);

        UserMembership saved = userMembershipRepository.save(newMembership);
        log.info("User {} successfully renewed membership {} (expires: {})", user.getId(), membershipId, endDate);

        return saved;
    }


    @Transactional
    @CacheEvict(value = "user_active_membership", key = "#user.id", allEntries = true)
    public UserMembership freezeMembership(User user) {
        log.info("User {} freezing membership", user.getId());

        UserMembership membership = userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now())
                .orElseThrow(() -> new IllegalStateException("User has no active membership to freeze"));

        if (membership.getStatus() == MembershipStatus.SUSPENDED) {
            throw new IllegalStateException("Membership is already frozen");
        }

        membership.setStatus(MembershipStatus.SUSPENDED);
        membership.setNotes("Frozen on " + LocalDate.now());

        UserMembership saved = userMembershipRepository.save(membership);
        log.info("User {} successfully froze membership", user.getId());

        return saved;
    }


    @Transactional
    @CacheEvict(value = "user_active_membership", key = "#user.id", allEntries = true)
    public UserMembership unfreezeMembership(User user) {
        log.info("User {} unfreezing membership", user.getId());

        UserMembership membership = userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now()).stream()
                .filter(m -> m.getStatus() == MembershipStatus.SUSPENDED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User has no frozen membership"));

        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setNotes("Unfrozen on " + LocalDate.now());

        UserMembership saved = userMembershipRepository.save(membership);
        log.info("User {} successfully unfroze membership", user.getId());

        return saved;
    }


    @Cacheable(value = "user_active_membership", key = "#user.id")
    public Optional<UserMembership> getUserActiveMembership(User user) {
        return userMembershipRepository.findActiveByUserId(user.getUserId(), LocalDate.now());
    }


    public List<UserMembership> getUserMemberships(User user) {
        return userMembershipRepository.findByUserId(user.getUserId());
    }

     public List<UserMembership> getMembershipsExpiringIn(int days) {
        LocalDate expiryDate = LocalDate.now().plusDays(days);
        return userMembershipRepository.findExpiringBefore(expiryDate);
    }


    @Scheduled(cron = "0 0 8 * * *") // Каждый день в 08:00
    @Transactional
    public void sendMembershipExpiringNotifications() {
        log.info("Starting membership expiring notifications task");

        List<UserMembership> expiringMemberships = getMembershipsExpiringIn(3);

        for (UserMembership membership : expiringMemberships) {
            User user = membership.getUser();
            long remainingDays = membership.getRemainingDays();

            boolean alreadyNotified = notificationRepository.findUserNotifications(user).stream()
                    .anyMatch(n -> n.getType() == Notification.NotificationType.MEMBERSHIP_EXPIRING
                            && n.getCreatedAt().toLocalDate().equals(LocalDate.now()));

            if (!alreadyNotified) {
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setEmail(user.getEmail());
                notification.setSubject("Your membership expires in " + remainingDays + " days");
                notification.setMessage("Your " + membership.getMembership().getName() + " membership will expire on " + membership.getEndDate());
                notification.setType(Notification.NotificationType.MEMBERSHIP_EXPIRING);
                notification.setIsSent(false);

                notificationRepository.save(notification);
                log.info("Created expiring notification for user {}", user.getId());
            }
        }

        log.info("Membership expiring notifications task completed");
    }


    @Transactional
    @CacheEvict(value = "active_memberships", allEntries = true)
    public Membership createMembership(Membership membership) {
        log.info("Creating new membership: {}", membership.getName());
        return membershipRepository.save(membership);
    }


    @Transactional
    @CacheEvict(value = "active_memberships", allEntries = true)
    public Membership updateMembership(Long id, Membership updates) {
        log.info("Updating membership {}", id);
        Membership membership = getMembershipById(id);
        
        if (updates.getName() != null) membership.setName(updates.getName());
        if (updates.getPrice() != null) membership.setPrice(updates.getPrice());
        if (updates.getDurationDays() != null) membership.setDurationDays(updates.getDurationDays());
        if (updates.getDescription() != null) membership.setDescription(updates.getDescription());
        if (updates.getIsActive() != null) membership.setIsActive(updates.getIsActive());

        return membershipRepository.save(membership);
    }
}
