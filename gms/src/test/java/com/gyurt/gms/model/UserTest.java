package com.gyurt.gms.model;

import com.gyurt.gms.repo.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@gms.com");
        user.setName("Test User");
        user.setPassword("password123");
        user.setRole(Role.USER);
    }

    @Test
    void testUserCreation() {
        assertNotNull(user);
        assertEquals(1L, user.getId());
        assertEquals("test@gms.com", user.getEmail());
        assertEquals("Test User", user.getName());
        assertEquals("password123", user.getPassword());
        assertEquals(Role.USER, user.getRole());
    }

    @Test
    void testGetUserId() {
        assertEquals(1L, user.getUserId());
    }

    @Test
    void testEquals_SameId() {
        User user2 = new User();
        user2.setId(1L);

        assertEquals(user, user2);
    }

    @Test
    void testEquals_DifferentId() {
        User user2 = new User();
        user2.setId(2L);

        assertNotEquals(user, user2);
    }

    @Test
    void testHashCode() {
        User user2 = new User();
        user2.setId(1L);

        assertEquals(user.hashCode(), user2.hashCode());
    }

    @Test
    void testDefaultRole() {
        User newUser = new User();
        assertEquals(Role.USER, newUser.getRole());
    }
}
