package com.gyurt.gms.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        // Setup if needed
    }

    @Test
    void testSendEmailAsync() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendEmailAsync("yurtayevgleb@gmail.com", "Test Subject", "Test Body");

        verify(mailSender, timeout(2000)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendMembershipExpiringEmail() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendMembershipExpiringEmail("yurtayevgleb@gmail.com", "Standard", 7);

        verify(mailSender, timeout(2000)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendMembershipExpiredEmail() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendMembershipExpiredEmail("yurtayevgleb@gmail.com", "Standard");

        verify(mailSender, timeout(2000)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendTrainingReminderEmail() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendTrainingReminderEmail("yurtayevgleb@gmail.com", "Yoga Class", "Coach Name", java.time.LocalDateTime.parse("2025-12-25T10:00:00"));

        verify(mailSender, timeout(2000)).send(any(SimpleMailMessage.class));
    }
}
