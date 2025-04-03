package com.quangcd.cinemaproject.service.theater;

import com.quangcd.cinemaproject.dto.TheaterDto;

import java.util.List;

public interface TheaterService {
    List<TheaterDto> findAllTheater();

    TheaterDto findTheaterById(Long theaterId);
}
