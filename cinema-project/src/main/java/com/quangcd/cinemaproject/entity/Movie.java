package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    private String mainGenre;

    @Temporal(TemporalType.DATE)
    private Date releaseDate;

    private String posterUrl;
    private int duration; // Duration in minutes
    private String director;
    private String rating;
    private String rateVote;
    private String trailerUrl;

}
