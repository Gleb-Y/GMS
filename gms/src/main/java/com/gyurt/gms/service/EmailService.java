package com.gyurt.gms.service;

import com.gyurt.gms.model.Notification;
import com.gyurt.gms.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.gyurt.gms.config.RabbitMQConfig.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;


    @Async("taskExecutor")
    public void sendEmailAsync(String to, String subject, String body) {
        try {
            log.info("Sending email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@gyms.com");

            mailSender.send(message);
            log.info("Email successfully sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }


    @RabbitListener(queues = EMAIL_QUEUE)
    @Transactional
    public void processEmailNotification(Notification notification) {
        log.info("Processing email notification for user {}", notification.getUser().getId());

        try {
            sendEmailAsync(notification.getEmail(), notification.getSubject(), notification.getMessage());

            notification.setIsSent(true);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);

            log.info("Email notification processed successfully for user {}", notification.getUser().getId());
        } catch (Exception e) {
            log.error("Error processing email notification for user {}", notification.getUser().getId(), e);
        }
    }


    @Async("taskExecutor")
    @Transactional
    public void sendPendingNotifications() {
        log.info("Starting to send pending notifications");

        List<Notification> pendingNotifications = notificationRepository.findPendingNotifications();
        log.info("Found {} pending notifications", pendingNotifications.size());

        for (Notification notification : pendingNotifications) {
            try {
                sendEmailAsync(notification.getEmail(), notification.getSubject(), notification.getMessage());

                notification.setIsSent(true);
                notification.setSentAt(LocalDateTime.now());
                notificationRepository.save(notification);

                log.info("Sent notification {} to {}", notification.getId(), notification.getEmail());
            } catch (Exception e) {
                log.error("Failed to send notification {}", notification.getId(), e);
            }
        }

        log.info("Completed sending pending notifications");
    }


    public void sendRegistrationEmail(String email, String name) {
        String subject = "Welcome to GMS - Gym Management System";
        String body = "Hello " + name + ",\n\n" +
                "Welcome to our Gym Management System!\n" +
                "Your account has been successfully created.\n\n" +
                "You can now log in and browse our membership plans.\n\n" +
                "Best regards,\n" +
                "GMS Team";

        sendEmailAsync(email, subject, body);
    }


    public void sendMembershipExpiringEmail(String email, String membershipName, long daysRemaining) {
        String subject = "Your membership expires in " + daysRemaining + " days";
        String body = "Hello,\n\n" +
                "Your " + membershipName + " membership will expire in " + daysRemaining + " days.\n" +
                "Please renew your membership to continue enjoying our services.\n\n" +
                "Best regards,\n" +
                "GMS Team";

        sendEmailAsync(email, subject, body);
    }


    public void sendMembershipExpiredEmail(String email, String membershipName) {
        String subject = "Your membership has expired";
        String body = "Hello,\n\n" +
                "Your " + membershipName + " membership has expired.\n" +
                "Please renew your membership to continue accessing our gym.\n\n" +
                "Best regards,\n" +
                "GMS Team";

        sendEmailAsync(email, subject, body);
    }


    public void sendTrainingReminderEmail(String email, String trainingName, String coachName, LocalDateTime startTime) {
        String subject = "Training reminder: " + trainingName;
        String body = "Hello,\n\n" +
                "This is a reminder about your upcoming training:\n" +
                "Training: " + trainingName + "\n" +
                "Coach: " + coachName + "\n" +
                "Time: " + startTime + "\n\n" +
                "See you there!\n\n" +
                "Best regards,\n" +
                "GMS Team";

        sendEmailAsync(email, subject, body);
    }
}
