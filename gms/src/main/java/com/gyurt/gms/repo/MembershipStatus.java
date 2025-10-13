package com.gyurt.gms.repo;

public enum MembershipStatus {
    ACTIVE,      // Абонемент активен
    EXPIRED,     // Срок истек
    CANCELLED,   // Отменен пользователем
    SUSPENDED    // Приостановлен (например, за нарушение правил)
}
