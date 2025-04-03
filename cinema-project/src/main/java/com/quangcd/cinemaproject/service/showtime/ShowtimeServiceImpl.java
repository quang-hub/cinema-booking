package com.quangcd.cinemaproject.service.showtime;

import com.quangcd.cinemaproject.dto.ShowtimeDto;
import com.quangcd.cinemaproject.entity.Showtime;
import com.quangcd.cinemaproject.repository.ShowTimeRepository;
import com.quangcd.cinemaproject.service.movie.MovieService;
import com.quangcd.cinemaproject.service.theater.TheaterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService{
    private final ShowTimeRepository showTimeRepository;
    private final MovieService movieService;
    private final TheaterService theaterService;
    @Override
    public List<ShowtimeDto> findAllShowtimeByDateAndTheaterId(Date date, Long theaterId) {
        List<ShowtimeDto> result = showTimeRepository.findByTheaterIdAndDate(theaterId, date)
                .stream().map(showtime -> ShowtimeDto.builder()
                        .id(showtime.getId())
                        .startDate(showtime.getStartDate())
                        .endDate(showtime.getEndDate())
                        .movie(movieService.findMovieById(showtime.getMovieId()))
                        .theater(theaterService.findTheaterById(showtime.getTheaterId()))
                        .build()
                ).toList();
        return result;
    }
}
