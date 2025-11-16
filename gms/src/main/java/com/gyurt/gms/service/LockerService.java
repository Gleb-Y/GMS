package com.gyurt.gms.service;

import com.gyurt.gms.model.Locker;
import com.gyurt.gms.model.LockerRent;
import com.gyurt.gms.model.User;
import com.gyurt.gms.repo.LockerRepository;
import com.gyurt.gms.repo.LockerRentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.gyurt.gms.config.RabbitMQConfig.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LockerService {

    private final LockerRepository lockerRepository;
    private final LockerRentRepository lockerRentRepository;
    private final RabbitTemplate rabbitTemplate;


//    @Cacheable(value = "available_lockers")
//    public List<Locker> getAvailableLockers() {
//        log.info("Fetching available lockers from database");
//        return lockerRepository.findAllAvailable();
//    }

    @Cacheable(value = "lockers", key = "'available'")
    public List<Locker> getAvailableLockers() {
        log.info("Fetching available lockers from database");
        return lockerRepository.findAllAvailable();
    }

    @Cacheable(value = "available_lockers_count")
    public Long getAvailableLockerCount() {
        return lockerRepository.countAvailable();
    }


    @Transactional
    @CacheEvict(value = {"available_lockers", "available_lockers_count"}, allEntries = true)
    public LockerRent rentLocker(Long lockerId, User user) {
        log.info("User {} attempting to rent locker {}", user.getId(), lockerId);

        Optional<LockerRent> existingRent = lockerRentRepository.findActiveRentByUser(user);
        if (existingRent.isPresent()) {
            throw new IllegalStateException("User already has an active locker rent");
        }

        Locker locker = lockerRepository.findById(lockerId)
                .orElseThrow(() -> new IllegalArgumentException("Locker not found"));

        if (!locker.getIsAvailable()) {
            throw new IllegalStateException("Locker is not available");
        }

        LockerRent rent = new LockerRent();
        rent.setUser(user);
        rent.setLocker(locker);
        rent.setRentDate(LocalDate.now());
        rent.setIsActive(true);

        locker.setIsAvailable(false);
        locker.setCurrentUser(user);
        lockerRepository.save(locker);

        LockerRent savedRent = lockerRentRepository.save(rent);
        log.info("Locker {} successfully rented by user {}", lockerId, user.getId());

        return savedRent;
    }


    @Transactional
    @CacheEvict(value = {"available_lockers", "available_lockers_count"}, allEntries = true)
    public void releaseLocker(Long rentId, User user) {
        log.info("User {} attempting to release locker rent {}", user.getId(), rentId);

        LockerRent rent = lockerRentRepository.findById(rentId)
                .orElseThrow(() -> new IllegalArgumentException("Locker rent not found"));

        if (!rent.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("User can only release their own locker");
        }

        if (!rent.getIsActive()) {
            throw new IllegalStateException("Locker rent is already released");
        }

        rent.setIsActive(false);
        rent.setReleasedAt(LocalDateTime.now());
        lockerRentRepository.save(rent);

        Locker locker = rent.getLocker();
        locker.setIsAvailable(true);
        locker.setCurrentUser(null);
        lockerRepository.save(locker);

        log.info("Locker {} successfully released by user {}", locker.getId(), user.getId());
    }


    @Scheduled(cron = "0 0 0 * * *") // Каждый день в 00:00
    @Transactional
    @CacheEvict(value = {"available_lockers", "available_lockers_count"}, allEntries = true)
    public void autoReleaseExpiredLockers() {
        log.info("Starting automatic locker release task");

        LocalDate today = LocalDate.now();
        List<LockerRent> expiredRents = lockerRentRepository.findExpiredRents(today);

        for (LockerRent rent : expiredRents) {
            rent.setIsActive(false);
            rent.setReleasedAt(LocalDateTime.now());
            lockerRentRepository.save(rent);

            Locker locker = rent.getLocker();
            locker.setIsAvailable(true);
            locker.setCurrentUser(null);
            lockerRepository.save(locker);

            log.info("Auto-released locker {} from user {}", locker.getId(), rent.getUser().getId());
        }

        log.info("Automatic locker release task completed. Released {} lockers", expiredRents.size());
    }


    public List<LockerRent> getUserRentHistory(User user) {
        return lockerRentRepository.findUserRentHistory(user);
    }


    public Optional<LockerRent> getUserActiveRent(User user) {
        return lockerRentRepository.findActiveRentByUser(user);
    }


    @Transactional
    public void initializeLockers() {
        log.info("Initializing 300 lockers");
        for (int i = 1; i <= 300; i++) {
            Locker locker = new Locker();
            locker.setLockerNumber(String.format("LOCKER-%03d", i));
            locker.setIsAvailable(true);
            lockerRepository.save(locker);
        }
        log.info("300 lockers initialized successfully");
    }
}
