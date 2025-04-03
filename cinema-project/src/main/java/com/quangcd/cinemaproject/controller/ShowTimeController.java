package com.quangcd.cinemaproject.controller;

import com.quangcd.cinemaproject.dto.response.BaseResponse;
import com.quangcd.cinemaproject.service.showtime.ShowtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@Slf4j
@RequestMapping("/api/showtime")
@RequiredArgsConstructor
public class ShowTimeController {

    private final ShowtimeService showtimeService;
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String theaterId,@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        BaseResponse<?> baseResponse = BaseResponse.builder()
                .code(200)
                .message("SUCCESS_MESSAGE")
                .data(showtimeService.findAllShowtimeByDateAndTheaterId(date,Long.parseLong(theaterId)))
                .build();
        return ResponseEntity.ok(baseResponse);
    }
}
