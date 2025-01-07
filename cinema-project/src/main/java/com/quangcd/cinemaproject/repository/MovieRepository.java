package com.quangcd.cinemaproject.repository;

import com.quangcd.cinemaproject.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
    List<Movie> findByMainGenre(String genre);
}
