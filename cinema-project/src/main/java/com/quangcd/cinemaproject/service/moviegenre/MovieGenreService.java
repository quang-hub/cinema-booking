package com.quangcd.cinemaproject.service.moviegenre;

import com.quangcd.cinemaproject.dto.MovieGenreDto;
import com.quangcd.cinemaproject.entity.Genre;
import com.quangcd.cinemaproject.entity.MovieGenre;

import java.util.List;

public interface MovieGenreService {
    List<MovieGenreDto> findAllMovieGenre();
    MovieGenreDto getDetailMovieById(Long movieId);
    void addDataFromScapt(List<String> genres, Long id);
}
