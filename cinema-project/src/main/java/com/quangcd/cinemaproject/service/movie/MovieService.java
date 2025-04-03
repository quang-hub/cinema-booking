package com.quangcd.cinemaproject.service.movie;

import com.quangcd.cinemaproject.dto.MovieDto;
import com.quangcd.cinemaproject.entity.Movie;

import java.util.List;

public interface MovieService {
    List<MovieDto> getAllMovies();
    MovieDto findMovieById(Long id);
}
