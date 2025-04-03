package com.quangcd.cinemaproject.dto;

import com.quangcd.cinemaproject.entity.Movie;
import com.quangcd.cinemaproject.entity.Theater;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShowtimeDto {
    private Long id;
    private Date startDate;
    private Date endDate;
    private MovieDto movie;
    private TheaterDto theater;
}
