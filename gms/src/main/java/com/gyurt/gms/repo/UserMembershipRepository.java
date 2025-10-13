package com.gyurt.gms.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {
    
    /**
     * Найти все абонементы пользователя
     */
    List<UserMembership> findByUserId(Long userId);
    
    /**
     * Найти активные абонементы пользователя
     */
    List<UserMembership> findByUserIdAndStatus(Long userId, MembershipStatus status);
    
    /**
     * Найти текущий активный абонемент пользователя
     */
    @Query("SELECT um FROM UserMembership um WHERE um.user.id = :userId " +
           "AND um.status = 'ACTIVE' AND um.endDate >= :currentDate " +
           "ORDER BY um.endDate DESC")
    Optional<UserMembership> findActiveByUserId(@Param("userId") Long userId, 
                                                  @Param("currentDate") LocalDate currentDate);
    
    /**
     * Найти истекшие абонементы
     */
    @Query("SELECT um FROM UserMembership um WHERE um.status = 'ACTIVE' AND um.endDate < :currentDate")
    List<UserMembership> findExpiredMemberships(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Найти все абонементы определенного типа
     */
    List<UserMembership> findByMembershipId(Long membershipId);
    
    /**
     * Проверить, есть ли у пользователя активный абонемент
     */
    @Query("SELECT COUNT(um) > 0 FROM UserMembership um WHERE um.user.id = :userId " +
           "AND um.status = 'ACTIVE' AND um.endDate >= :currentDate")
    boolean hasActiveMembership(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);
}
