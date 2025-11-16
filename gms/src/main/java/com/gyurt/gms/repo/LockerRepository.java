package com.gyurt.gms.repo;

import com.gyurt.gms.model.Locker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockerRepository extends JpaRepository<Locker, Long> {
    
    Optional<Locker> findByLockerNumber(String lockerNumber);
    
    @Query("SELECT l FROM Locker l WHERE l.isAvailable = true")
    List<Locker> findAllAvailable();
    
    @Query("SELECT COUNT(l) FROM Locker l WHERE l.isAvailable = true")
    Long countAvailable();
}
