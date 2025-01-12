package com.quangcd.cinemaproject;

import com.quangcd.cinemaproject.scrap.movie.MovieScrapter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class CinemaProjectApplication {

    public static void main(String[] args) {
        // Store the application context
        ApplicationContext context = SpringApplication.run(CinemaProjectApplication.class, args);

        // Get the MovieScrapter bean from the context
//        MovieScrapter scrapter = context.getBean(MovieScrapter.class);
//        scrapter.scrapeMovies();
    }

}
