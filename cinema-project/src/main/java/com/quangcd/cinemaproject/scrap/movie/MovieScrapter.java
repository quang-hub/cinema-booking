package com.quangcd.cinemaproject.scrap.movie;

import com.quangcd.cinemaproject.entity.Movie;
import com.quangcd.cinemaproject.repository.MovieRepository;
import com.quangcd.cinemaproject.service.moviegenre.MovieGenreService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MovieScrapter {


    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MovieGenreService movieGenreService;

    public void scrapeMovies() {
        String top250Url = "https://www.imdb.com/chart/top/?ref_=nv_mv_250";
        String domain = "https://www.imdb.com";

        try {
            // Connect to the website
            Document doc = Jsoup.connect(top250Url).get();

            // Extract links
            Element firstUl = doc.select("ul.ipc-metadata-list").first();
            Elements listLi = firstUl.select("li");

            for (Element li : listLi) {
                Element mainInfo = li.selectFirst("div.sc-300a8231-0");

                // Movie details
                Element movie = mainInfo.getElementsByTag("a").first();
                String movieName = movie.text().substring(3);
                Elements dateAndTime = mainInfo.select("span.sc-300a8231-7");
                String releaseYear = dateAndTime.select("span").get(0).text();
                String duration = dateAndTime.select("span").get(1).text();
                int durationInMinutes = convertToMinutes(duration);
                String rating = mainInfo.select("span.ipc-rating-star--rating").text();
                String voteNumber = mainInfo.select("span.ipc-rating-star--voteCount").text();

                // Additional details
                String detailUrl = domain + movie.attr("href");
                Document doc1 = Jsoup.connect(detailUrl).get();
                Element genreElement = doc1.select("div.ipc-chip-list--baseAlt").first();
                List<String> genres = genreElement.select("span")
                        .stream()
                        .map(Element::text)
                        .collect(Collectors.toList());
                String description = doc1.select("p.sc-3ac15c8d-3").text();
                String director = doc1.selectFirst("li.ipc-metadata-list__item").selectFirst("a").text();
                Element imageElement = doc1.select("div.ipc-media").first();
                String imgSource = imageElement.selectFirst("img").attr("src");

                // Trailer
                Element videoElement = doc1.select("a.ipc-lockup-overlay").get(1);
                String detailTrailUrl = domain + videoElement.attr("href");

                SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");

                // Save movie to the repository
                Movie savedMovie = movieRepository.save(
                        Movie.builder()
                                .title(movieName)
                                .releaseDate(yearFormat.parse(releaseYear))
                                .duration(durationInMinutes)
                                .rating(rating)
                                .rateVote(voteNumber)
                                .mainGenre(genres.get(0))
                                .description(description)
                                .director(director)
                                .posterUrl(imgSource)
                                .trailerUrl(detailTrailUrl)
                                .build()
                );

                movieGenreService.addDataFromScapt(genres,savedMovie.getId());
                System.out.println("Saved movie: " + movieName);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public int convertToMinutes(String timeString) {
        String[] parts = timeString.split(" ");
        int hours = Integer.parseInt(parts[0].replace("h", ""));
        int minutes = Integer.parseInt(parts[1].replace("m", ""));
        return (hours * 60 + minutes);
    }
}
