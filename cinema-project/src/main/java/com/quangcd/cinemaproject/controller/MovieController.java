package com.quangcd.cinemaproject.controller;


import com.quangcd.cinemaproject.dto.response.BaseResponse;
import com.quangcd.cinemaproject.service.movie.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/movie")
@RequiredArgsConstructor

public class MovieController {

    private final MovieService movieService;

    @PostMapping("/search")
    public ResponseEntity<?> search(){

        BaseResponse<?> baseResponse = BaseResponse.builder()
                .code(200)
                .message("SUCCESS_MESSAGE")
                .data(movieService.getAllMovies())
                .build();

        return ResponseEntity.ok(baseResponse);
    }
}
