package com.gyurt.gms.repo;

import com.gyurt.gms.model.Notification;
import com.gyurt.gms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC")
    List<Notification> findUserNotifications(@Param("user") User user);
    
    @Query("SELECT n FROM Notification n WHERE n.isSent = false ORDER BY n.createdAt ASC")
    List<Notification> findPendingNotifications();
    
    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.isSent = false")
    List<Notification> findPendingByType(@Param("type") Notification.NotificationType type);
}
