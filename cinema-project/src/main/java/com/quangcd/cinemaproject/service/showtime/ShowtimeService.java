package com.quangcd.cinemaproject.service.showtime;

import com.quangcd.cinemaproject.dto.ShowtimeDto;

import java.util.Date;
import java.util.List;

public interface ShowtimeService {
    List<ShowtimeDto> findAllShowtimeByDateAndTheaterId(Date date, Long theaterId);

}
