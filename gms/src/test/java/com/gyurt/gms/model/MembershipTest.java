package com.gyurt.gms.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class MembershipTest {

    private Membership membership;

    @BeforeEach
    void setUp() {
        membership = new Membership();
        membership.setId(1L);
        membership.setName("Standard");
        membership.setPrice(new BigDecimal("1000"));
        membership.setDurationDays(30);
        membership.setDescription("Standard membership");
        membership.setIsActive(true);
    }

    @Test
    void testMembershipCreation() {
        assertNotNull(membership);
        assertEquals(1L, membership.getId());
        assertEquals("Standard", membership.getName());
        assertEquals(new BigDecimal("1000"), membership.getPrice());
        assertEquals(30, membership.getDurationDays());
        assertEquals("Standard membership", membership.getDescription());
        assertTrue(membership.getIsActive());
    }

    @Test
    void testDefaultIsActive() {
        Membership newMembership = new Membership();
        assertTrue(newMembership.getIsActive());
    }

    @Test
    void testSettersAndGetters() {
        membership.setName("Premium");
        membership.setPrice(new BigDecimal("2000"));
        membership.setDurationDays(60);
        membership.setIsActive(false);

        assertEquals("Premium", membership.getName());
        assertEquals(new BigDecimal("2000"), membership.getPrice());
        assertEquals(60, membership.getDurationDays());
        assertFalse(membership.getIsActive());
    }
}
