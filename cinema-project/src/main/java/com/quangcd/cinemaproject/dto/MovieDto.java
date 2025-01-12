package com.quangcd.cinemaproject.dto;

import com.quangcd.cinemaproject.entity.Genre;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder

public class MovieDto {
    private Long id;
    private String title;
    private String description;
    private String mainGenre;
    private Date releaseDate;
    private String posterUrl;
    private int duration;
    private String director;
    private String rating;
    private String rateVote;
    private String trailerUrl;
    private List<Genre> genres;

}
