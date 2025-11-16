package com.gyurt.gms.repo;

import com.gyurt.gms.model.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {
    

    List<UserMembership> findByUserId(Long userId);

    List<UserMembership> findByUserIdAndStatus(Long userId, MembershipStatus status);
    
    @Query("SELECT um FROM UserMembership um WHERE um.status = 'ACTIVE' AND um.endDate <= :expiryDate")
    List<UserMembership> findExpiringBefore(@Param("expiryDate") LocalDate expiryDate);
    

    @Query("SELECT um FROM UserMembership um WHERE um.user.id = :userId " +
           "AND um.status = 'ACTIVE' AND um.endDate >= :currentDate " +
           "ORDER BY um.endDate DESC")
    Optional<UserMembership> findActiveByUserId(@Param("userId") Long userId, 
                                                  @Param("currentDate") LocalDate currentDate);
    

    @Query("SELECT um FROM UserMembership um WHERE um.status = 'ACTIVE' AND um.endDate < :currentDate")
    List<UserMembership> findExpiredMemberships(@Param("currentDate") LocalDate currentDate);
    

    List<UserMembership> findByMembershipId(Long membershipId);
    

    @Query("SELECT COUNT(um) > 0 FROM UserMembership um WHERE um.user.id = :userId " +
           "AND um.status = 'ACTIVE' AND um.endDate >= :currentDate")
    boolean hasActiveMembership(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);
}
