package com.gyurt.gms.repo;

import com.gyurt.gms.model.TrainingBooking;
import com.gyurt.gms.model.TrainingSchedule;
import com.gyurt.gms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingBookingRepository extends JpaRepository<TrainingBooking, Long> {
    
    @Query("SELECT tb FROM TrainingBooking tb WHERE tb.user = :user AND tb.isCancelled = false ORDER BY tb.schedule.startTime DESC")
    List<TrainingBooking> findUserActiveBookings(@Param("user") User user);
    
    @Query("SELECT tb FROM TrainingBooking tb WHERE tb.schedule = :schedule AND tb.isCancelled = false")
    List<TrainingBooking> findScheduleBookings(@Param("schedule") TrainingSchedule schedule);
    
    @Query("SELECT tb FROM TrainingBooking tb WHERE tb.user = :user AND tb.schedule = :schedule AND tb.isCancelled = false")
    Optional<TrainingBooking> findUserScheduleBooking(@Param("user") User user, @Param("schedule") TrainingSchedule schedule);
    
    @Query("SELECT COUNT(tb) FROM TrainingBooking tb WHERE tb.schedule = :schedule AND tb.isCancelled = false")
    Integer countActiveBookings(@Param("schedule") TrainingSchedule schedule);
}
