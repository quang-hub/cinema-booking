package com.quangcd.cinemaproject.service.moviegenre;

import com.quangcd.cinemaproject.dto.MovieGenreDto;
import com.quangcd.cinemaproject.entity.Genre;
import com.quangcd.cinemaproject.entity.MovieGenre;
import com.quangcd.cinemaproject.repository.GenreRepository;
import com.quangcd.cinemaproject.repository.MovieGenreRepository;
import com.quangcd.cinemaproject.service.genre.GenreService;
import com.quangcd.cinemaproject.service.movie.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MovieGenreServiceImpl implements MovieGenreService {

    private final MovieGenreRepository movieGenreRepository;
    private final GenreService genreService;
    private final MovieService movieService;

    @Override
    public List<MovieGenreDto> findAllMovieGenre() {
        List<MovieGenre> list = movieGenreRepository.findAll();
        List<MovieGenreDto> result = new ArrayList<>();

        result = list.stream()
                .map(movieGenre -> new MovieGenreDto(movieGenre.getId(),
                        movieService.findMovieById(movieGenre.getMovieId())
                        , new ArrayList<>()  ))
                .collect(Collectors.toList());
        return result;
    }

    @Override
    public MovieGenreDto getDetailMovieById(Long movieId) {
        MovieGenreDto result = MovieGenreDto.builder()
                .movie(movieService.findMovieById(movieId))
                .genre(movieGenreRepository.findByMovieId(movieId).stream()
                        .map(movieGenre -> genreService.findGenreById(movieGenre.getGenreId()))
                        .map(Genre::getName)
                        .collect(Collectors.toList()))
                .build();

        return result;
    }

    @Override
    public void addDataFromScapt(List<String> genres, Long id) {
        genreService.addAll(genres);
        for (String genre : genres) {
            movieGenreRepository.save(MovieGenre.builder()
                    .movieId(id)
                    .genreId(genreService.findGenreByName(genre).getId())
                    .build());
        }

    }
}
