package com.gyurt.gms.repo;

import com.gyurt.gms.model.LockerRent;
import com.gyurt.gms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LockerRentRepository extends JpaRepository<LockerRent, Long> {
    
    @Query("SELECT lr FROM LockerRent lr WHERE lr.user = :user AND lr.isActive = true")
    Optional<LockerRent> findActiveRentByUser(@Param("user") User user);
    
    @Query("SELECT lr FROM LockerRent lr WHERE lr.rentDate = :date AND lr.isActive = true")
    List<LockerRent> findActiveRentsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT lr FROM LockerRent lr WHERE lr.isActive = true AND lr.rentDate < :date")
    List<LockerRent> findExpiredRents(@Param("date") LocalDate date);
    
    @Query("SELECT lr FROM LockerRent lr WHERE lr.user = :user ORDER BY lr.createdAt DESC")
    List<LockerRent> findUserRentHistory(@Param("user") User user);
}
