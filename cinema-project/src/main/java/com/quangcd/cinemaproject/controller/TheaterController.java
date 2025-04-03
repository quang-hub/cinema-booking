package com.quangcd.cinemaproject.controller;

import com.quangcd.cinemaproject.dto.response.BaseResponse;
import com.quangcd.cinemaproject.service.theater.TheaterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/theater")
@RequiredArgsConstructor
public class TheaterController {
    private final TheaterService theaterService;

    @GetMapping("/search")
    public ResponseEntity<?> search(){
        BaseResponse<?> baseResponse = BaseResponse.builder()
                .code(200)
                .message("SUCCESS_MESSAGE")
                .data(theaterService.findAllTheater())
                .build();
        return ResponseEntity.ok(baseResponse);
    }
}
