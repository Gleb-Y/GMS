package com.gyurt.gms.repo;

import com.gyurt.gms.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    
    /**
     * Найти все активные абонементы
     */
    List<Membership> findByIsActiveTrue();
    
    /**
     * Найти абонемент по названию
     */
    Membership findByName(String name);
    
    /**
     * Проверить существование абонемента по названию
     */
    boolean existsByName(String name);
}
