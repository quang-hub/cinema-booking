package com.quangcd.cinemaproject.scrap.movie;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.List;
import java.util.stream.Collectors;

public class MovieScrapter {
    public static void main(String[] args) {
        String mostPopularUrl ="https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm";
        String top250Url ="https://www.imdb.com/chart/top/?ref_=nv_mv_250";
        String domain ="https://www.imdb.com";
        try {
            // Connect to the website
            Document doc = Jsoup.connect(top250Url).get();

            // Extract links
//            Elements links = doc.select("ul");
            Element firstUl = doc.select("ul.ipc-metadata-list").first();
//            System.out.println(firstUl);
            Elements listLi= firstUl.select("li");
            int count=1;
            for (Element li : listLi) {
//                Element main = li.selectFirst("div.bBseWt");
                Element mainInfo = li.selectFirst("div.sc-300a8231-0");
                // content in main info
                Element movie = mainInfo.getElementsByTag("a").first();
                String movieName = movie.text();
                Elements dateAndTime = mainInfo.select("span.sc-300a8231-7");
                String releaseYear = dateAndTime.select("span").get(0).text();
                String duration = dateAndTime.select("span").get(1).text();
                String rating = mainInfo.select("span.ipc-rating-star--rating").text();
                String voteNumber = mainInfo.select("span.ipc-rating-star--voteCount").text();

                // content desciption, genre
                String detailUrl = domain+movie.attr("href");
                Document doc1 = Jsoup.connect(detailUrl).get();
                Element genreElement = doc1.select("div.ipc-chip-list--baseAlt").first();
                List<String> genres = genreElement.select("span")
                        .stream()
                        .map(Element::text)
                        .collect(Collectors.toList());
                String description = doc1.select("p.sc-3ac15c8d-3").text();

                // content director
                String director = doc1.selectFirst("li.ipc-metadata-list__item").selectFirst("a").text();

                // content image
                Element imageElement = doc1.select("div.ipc-media").first();
                String imgSource = imageElement.selectFirst("img").attr("src");


                // content video
                Element videoElement = doc1.select("a.ipc-lockup-overlay").get(1);
                String detailTrailUrl = domain+ videoElement.attr("href");
                Document doc2 = Jsoup.connect(detailTrailUrl).get();
                Element videoElementSrc = doc2.getElementById("imdbnext-vp-container");
                System.out.println(videoElementSrc);

                System.out.println(movieName+", "+releaseYear+", "+duration+", "+rating+", "+voteNumber);
                System.out.println(genres);
                System.out.println(description);
                System.out.println(director);
                System.out.println(imgSource);
                count++;
                if(count==10)break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

