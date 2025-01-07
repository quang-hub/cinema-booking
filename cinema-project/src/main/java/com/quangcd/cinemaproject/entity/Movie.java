package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
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
    private String description;
    private String mainGenre;

    @Temporal(TemporalType.DATE)
    private Date releaseDate;

    private String posterUrl;
    private int duration; // Duration in minutes
}
