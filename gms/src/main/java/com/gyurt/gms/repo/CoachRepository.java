package com.gyurt.gms.repo;

import com.gyurt.gms.model.Coach;
import com.gyurt.gms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachRepository extends JpaRepository<Coach, Long> {
    
    Optional<Coach> findByUser(User user);
    
    @Query("SELECT c FROM Coach c WHERE c.isActive = true")
    List<Coach> findAllActive();
    
    @Query("SELECT c FROM Coach c WHERE c.specialization LIKE %:specialization% AND c.isActive = true")
    List<Coach> findBySpecialization(@Param("specialization") String specialization);
}
