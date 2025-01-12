package com.quangcd.cinemaproject.controller;


import com.quangcd.cinemaproject.dto.response.BaseResponse;
import com.quangcd.cinemaproject.service.moviegenre.MovieGenreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/movieGenre")
@RequiredArgsConstructor

public class MovieGenreController {

    private final MovieGenreService movieGenreService;

    @PostMapping("/search")
    public ResponseEntity<?> search(){
        BaseResponse<?> baseResponse = BaseResponse.builder()
                .code(200)
                .message("SUCCESS_MESSAGE")
                .data(movieGenreService.findAllMovieGenre())
                .build();
        return ResponseEntity.ok(baseResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieGenreByMovieId(@PathVariable Long id){
        BaseResponse<?> baseResponse = BaseResponse.builder()
                .code(200)
                .message("SUCCESS_MESSAGE")
                .data(movieGenreService.getDetailMovieById(id))
                .build();
        return ResponseEntity.ok(baseResponse);
    }

}
