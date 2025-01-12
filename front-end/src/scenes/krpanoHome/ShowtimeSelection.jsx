import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Nếu dùng MUI Icons
import PropTypes from "prop-types";
import DayPicker from "../../components/DatePicker";

const ShowtimeSelection = ({
    movieData,
    selectedShowtime,
    setSelectedShowtime,
    setStep,
    t
}) => {
    if (!movieData) {
        return <div>Loading...</div>;
    }

    const {
        title,
        description,
        mainGenre,
        releaseDate,
        posterUrl,
        duration,
        director,
        rating,
        rateVote,
        trailerUrl,
    } = movieData.movie;

    const genres = movieData.genre
        .map((genre) =>
            genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
        )
        .join(", ");

    return (
        <div className="max-w-4xl mx-auto p-6 h-full">
            {/* Back Button */}
            <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-6"
            >
                <ArrowBackIcon />
                <span>{t("Back")}</span>
            </button>
            {/* Movie Info */}
            <div style={{ display: "flex", gap: "20px" }}>
                <img
                    src={posterUrl}
                    alt={title}
                    style={{ width: "25%", height: "300px", objectFit: "cover" }}
                />
                <div>
                    <h1 className="text-3xl">{title}</h1>
                    <div className="grid grid-cols-[150px_1fr] gap-2 items-center">
                        <p className="font-bold text-lg">{t("Director")}</p>
                        <p className="text-lg">{director}</p>

                        <p className="font-bold text-lg">{t("Genre")}</p>
                        <p className="text-lg">{genres}</p>

                        <p className="font-bold text-lg">{t("ReleaseDate")}</p>
                        <p className="text-lg">{releaseDate}</p>

                        <p className="font-bold text-lg">{t("Duration")} </p>
                        <p className="text-lg">{duration} {t("mintes")}</p>

                        <p className="font-bold text-lg">{t("Rating")}</p>
                        <p className="text-lg">
                            {rating} {rateVote}
                        </p>

                        <p className="font-bold text-lg">{t("MainGenre")}</p>
                        <p className="text-lg">{mainGenre}</p>

                        <p className="font-bold text-lg">{t("Trailer")}</p>
                        <a
                            href={trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-lg rounded border-2 border-slate-400 flex justify-center items-center"
                        >

                            {t("WatchTrailer")}
                        </a>
                    </div>

                </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: "20px" }}>
                <h2 className="text-2xl">{t("Description")}</h2>
                <p className="text-base">{description}</p>
            </div>



            {/* Showtime Selection */}
            <h2 className="text-2xl font-bold mt-6 mb-4">
                {title} - {t("selectShowtime")}
            </h2>

            <DayPicker />
        </div>
    );
};

ShowtimeSelection.propTypes = {
    movieData: PropTypes.object.isRequired,
    showtimes: PropTypes.array.isRequired,
    selectedShowtime: PropTypes.string,
    setSelectedShowtime: PropTypes.func.isRequired,
    setStep: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default ShowtimeSelection;
