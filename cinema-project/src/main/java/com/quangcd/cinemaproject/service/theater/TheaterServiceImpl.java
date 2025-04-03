package com.quangcd.cinemaproject.service.theater;

import com.quangcd.cinemaproject.dto.TheaterDto;
import com.quangcd.cinemaproject.entity.Theater;
import com.quangcd.cinemaproject.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor

public class TheaterServiceImpl implements TheaterService {
    private final TheaterRepository theaterRepository;

    @Override
    public List<TheaterDto> findAllTheater() {
        return theaterRepository.findAll().stream().map(theater ->
                TheaterDto.builder()
                        .id(theater.getId())
                        .name(theater.getName())
                        .location(theater.getLocation())
                        .totalSeats(theater.getTotalSeats())
                        .build())
                .toList();
    }

    @Override
    public TheaterDto findTheaterById(Long theaterId) {
        Optional<Theater> optionalTheaterDto = theaterRepository.findById(theaterId);

        if(optionalTheaterDto.isPresent()) {
            Theater theater = optionalTheaterDto.get();
            return TheaterDto.builder()
                    .id(theater.getId())
                    .name(theater.getName())
                    .location(theater.getLocation())
                    .totalSeats(theater.getTotalSeats())
                    .build();
        }
        return null;
    }
}
