package com.gyurt.gms.repo;

import com.gyurt.gms.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    

    List<Membership> findByIsActiveTrue();
    

    Membership findByName(String name);
    

    boolean existsByName(String name);
}
