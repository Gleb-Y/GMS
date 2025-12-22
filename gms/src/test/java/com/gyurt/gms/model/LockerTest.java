package com.gyurt.gms.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LockerTest {

    private Locker locker;

    @BeforeEach
    void setUp() {
        locker = new Locker();
        locker.setId(1L);
        locker.setLockerNumber("LOCKER-001");
        locker.setIsAvailable(true);
    }

    @Test
    void testLockerCreation() {
        assertNotNull(locker);
        assertEquals(1L, locker.getId());
        assertEquals("LOCKER-001", locker.getLockerNumber());
        assertTrue(locker.getIsAvailable());
    }

    @Test
    void testDefaultIsAvailable() {
        Locker newLocker = new Locker();
        assertTrue(newLocker.getIsAvailable());
    }

    @Test
    void testSetCurrentUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@gms.com");

        locker.setCurrentUser(user);
        locker.setIsAvailable(false);

        assertNotNull(locker.getCurrentUser());
        assertEquals(user, locker.getCurrentUser());
        assertFalse(locker.getIsAvailable());
    }

    @Test
    void testReleaseLocker() {
        locker.setCurrentUser(null);
        locker.setIsAvailable(true);

        assertNull(locker.getCurrentUser());
        assertTrue(locker.getIsAvailable());
    }
}
