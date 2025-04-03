package com.quangcd.cinemaproject.repository;

import com.quangcd.cinemaproject.dto.ShowtimeDto;
import com.quangcd.cinemaproject.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ShowTimeRepository extends JpaRepository<Showtime,Long> {
    @Query("SELECT s FROM Showtime s WHERE s.theaterId = :theaterId AND DATE(s.startDate) = DATE(:date)")
    List<Showtime> findByTheaterIdAndDate(@Param("theaterId") Long theaterId, @Param("date") Date date);
}
