package com.quangcd.cinemaproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheaterDto {
    private Long id;
    private String name;
    private String location;
    private int totalSeats;
}
