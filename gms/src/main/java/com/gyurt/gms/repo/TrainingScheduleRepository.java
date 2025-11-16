package com.gyurt.gms.repo;

import com.gyurt.gms.model.Coach;
import com.gyurt.gms.model.TrainingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrainingScheduleRepository extends JpaRepository<TrainingSchedule, Long> {
    
    @Query("SELECT ts FROM TrainingSchedule ts WHERE ts.coach = :coach AND ts.isActive = true ORDER BY ts.startTime ASC")
    List<TrainingSchedule> findCoachSchedules(@Param("coach") Coach coach);
    
    @Query("SELECT ts FROM TrainingSchedule ts WHERE ts.startTime >= :from AND ts.startTime <= :to AND ts.isActive = true ORDER BY ts.startTime ASC")
    List<TrainingSchedule> findSchedulesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    
    @Query("SELECT ts FROM TrainingSchedule ts WHERE ts.isActive = true AND ts.startTime > CURRENT_TIMESTAMP ORDER BY ts.startTime ASC")
    List<TrainingSchedule> findUpcomingSchedules();
    
    @Query("SELECT COUNT(tb) FROM TrainingBooking tb WHERE tb.schedule = :schedule AND tb.isCancelled = false")
    Integer countBookings(@Param("schedule") TrainingSchedule schedule);
}
