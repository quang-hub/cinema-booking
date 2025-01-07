package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date startTime;

    @Column(name = "movie_id")
    private Long movieId; // Reference to Movie ID

    @Column(name = "theater_id")
    private Long theaterId; // Reference to Theater ID
}

