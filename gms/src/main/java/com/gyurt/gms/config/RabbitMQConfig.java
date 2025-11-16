package com.gyurt.gms.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    public static final String EMAIL_QUEUE = "email.queue";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String REPORT_QUEUE = "report.queue";
    public static final String LOCKER_CLEANUP_QUEUE = "locker.cleanup.queue";

    public static final String EMAIL_EXCHANGE = "email.exchange";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String REPORT_EXCHANGE = "report.exchange";
    public static final String LOCKER_EXCHANGE = "locker.exchange";

    public static final String EMAIL_ROUTING_KEY = "email.send";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.send";
    public static final String REPORT_ROUTING_KEY = "report.generate";
    public static final String LOCKER_ROUTING_KEY = "locker.cleanup";

    @Bean
    public Queue emailQueue() {
        return new Queue(EMAIL_QUEUE, true);
    }

    @Bean
    public DirectExchange emailExchange() {
        return new DirectExchange(EMAIL_EXCHANGE, true, false);
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange emailExchange) {
        return BindingBuilder.bind(emailQueue).to(emailExchange).with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Queue reportQueue() {
        return new Queue(REPORT_QUEUE, true);
    }

    @Bean
    public DirectExchange reportExchange() {
        return new DirectExchange(REPORT_EXCHANGE, true, false);
    }

    @Bean
    public Binding reportBinding(Queue reportQueue, DirectExchange reportExchange) {
        return BindingBuilder.bind(reportQueue).to(reportExchange).with(REPORT_ROUTING_KEY);
    }

    @Bean
    public Queue lockerCleanupQueue() {
        return new Queue(LOCKER_CLEANUP_QUEUE, true);
    }

    @Bean
    public DirectExchange lockerExchange() {
        return new DirectExchange(LOCKER_EXCHANGE, true, false);
    }

    @Bean
    public Binding lockerBinding(Queue lockerCleanupQueue, DirectExchange lockerExchange) {
        return BindingBuilder.bind(lockerCleanupQueue).to(lockerExchange).with(LOCKER_ROUTING_KEY);
    }
}
