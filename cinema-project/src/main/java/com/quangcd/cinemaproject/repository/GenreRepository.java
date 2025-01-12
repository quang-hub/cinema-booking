package com.quangcd.cinemaproject.repository;

import com.quangcd.cinemaproject.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    boolean existsByName(String name);

    Genre findByName(String name);
}
