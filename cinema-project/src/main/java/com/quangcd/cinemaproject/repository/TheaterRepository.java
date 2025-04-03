package com.quangcd.cinemaproject.repository;

import com.quangcd.cinemaproject.dto.TheaterDto;
import com.quangcd.cinemaproject.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {
//    List<TheaterDto> findAllTheaterDto();
}
