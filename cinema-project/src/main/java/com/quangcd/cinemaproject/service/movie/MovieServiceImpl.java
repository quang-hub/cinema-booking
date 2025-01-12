package com.quangcd.cinemaproject.service.movie;

import com.quangcd.cinemaproject.dto.MovieDto;
import com.quangcd.cinemaproject.entity.Genre;
import com.quangcd.cinemaproject.entity.Movie;
import com.quangcd.cinemaproject.entity.MovieGenre;
import com.quangcd.cinemaproject.repository.GenreRepository;
import com.quangcd.cinemaproject.repository.MovieRepository;
import com.quangcd.cinemaproject.service.genre.GenreService;
import com.quangcd.cinemaproject.service.genre.GenreServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor

public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreService genreService;


    @Override
    public List<MovieDto> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        List<MovieDto> movieDtoList = movies.stream()
                .map(movie ->
                        new MovieDto(movie.getId(), movie.getTitle(), movie.getDescription()
                                ,movie.getMainGenre(),movie.getReleaseDate(),movie.getPosterUrl()
                        ,movie.getDuration(),movie.getDirector(),movie.getRating(),
                                movie.getRateVote(),movie.getTrailerUrl(),new ArrayList<>())) // Convert entities to DTOs
                .collect(Collectors.toList());
        return movieDtoList;
    }

    @Override
    public Movie findMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

}
