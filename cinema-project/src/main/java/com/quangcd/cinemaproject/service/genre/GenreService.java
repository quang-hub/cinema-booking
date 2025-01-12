package com.quangcd.cinemaproject.service.genre;

import com.quangcd.cinemaproject.entity.Genre;

import java.util.List;

public interface GenreService {
    Genre findGenreById(Long genreId);
    Genre findGenreByName(String name);

    void addAll(List<String> genres);
}
