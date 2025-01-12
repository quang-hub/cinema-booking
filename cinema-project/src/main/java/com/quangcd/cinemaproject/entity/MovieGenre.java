package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "MovieGenre")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieGenre extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long movieId;
    private Long genreId;
}
