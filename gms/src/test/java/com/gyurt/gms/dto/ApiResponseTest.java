package com.gyurt.gms.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void testSuccessResponse() {
        String data = "Test Data";
        ApiResponse<String> response = ApiResponse.success(data, "Success message");

        assertTrue(response.isSuccess());
        assertEquals("Success message", response.getMessage());
        assertEquals(data, response.getData());
        assertEquals(200, response.getStatus());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testErrorResponse() {
        ApiResponse<String> response = ApiResponse.error("Error message", 400);

        assertFalse(response.isSuccess());
        assertEquals("Error message", response.getMessage());
        assertNull(response.getData());
        assertEquals(400, response.getStatus());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testCreatedResponse() {
        String data = "Created Data";
        ApiResponse<String> response = ApiResponse.created(data, "Created successfully");

        assertTrue(response.isSuccess());
        assertEquals("Created successfully", response.getMessage());
        assertEquals(data, response.getData());
        assertEquals(201, response.getStatus());
    }

    @Test
    void testTimestampNotNull() {
        ApiResponse<String> response = ApiResponse.success("data", "message");
        
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testSettersAndGetters() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Test message");
        response.setData("Test data");
        response.setStatus(200);

        assertTrue(response.isSuccess());
        assertEquals("Test message", response.getMessage());
        assertEquals("Test data", response.getData());
        assertEquals(200, response.getStatus());
    }
}
