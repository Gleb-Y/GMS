package com.gyurt.gms.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Утилита для генерации BCrypt хешей паролей
 * Используйте этот класс для создания хешей для SQL миграций
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "password123";
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println();
        System.out.println("SQL для вставки:");
        System.out.println("INSERT INTO users (email, name, password, role, created_at, updated_at)");
        System.out.println("VALUES ('admin@gms.com', 'Admin User', '" + hash + "', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);");
    }
}
