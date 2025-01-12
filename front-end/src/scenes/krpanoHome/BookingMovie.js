import React, { useState } from "react";
import { FaRegClock, FaChair, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const movies = [
    {
        id: 1,
        title: "The Dark Horizon",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
        genre: "Science Fiction",
        duration: "2h 30min"
    },
    {
        id: 2,
        title: "Summer Dreams",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728",
        genre: "Romance",
        duration: "1h 45min"
    },
    {
        id: 3,
        title: "Urban Chase",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
        genre: "Action",
        duration: "2h 15min"
    },
    {
        id: 4,
        title: "Mystery Manor",
        image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
        genre: "Thriller",
        duration: "2h"
    },
];

const showtimes = [
    "10:00 AM",
    "1:00 PM",
    "4:00 PM",
    "7:00 PM",
    "10:00 PM"
];

const generateSeats = () => {
    const rows = ["A", "B", "C", "D", "E", "F"];
    const seatsPerRow = 8;
    const seats = [];

    rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
            seats.push({
                id: `${row}${i}`,
                row: row,
                number: i,
                isBooked: Math.random() < 0.3
            });
        }
    });

    return seats;
};

const MovieTicketBooking = () => {
    const { t, i18n } = useTranslation();

    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [step, setStep] = useState(1);
    const [seats] = useState(generateSeats());

    const handleSeatSelection = (seat) => {
        if (seat.isBooked) return;

        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const MovieSelection = () => (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {movies.map((movie) => (
                    <div key={movie.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
                        <img src={movie.image} alt={movie.title} className="w-full h-64 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
                            <p className="text-gray-600 mb-2">{movie.genre}</p>
                            <p className="text-gray-600 mb-4">
                                <FaRegClock className="inline mr-2" />
                                {movie.duration}
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedMovie(movie);
                                    setStep(2);
                                }}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                            >
                                {t('viewDetails')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ShowtimeSelection = () => (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{selectedMovie.title} - {t('selectShowtime')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {showtimes.map((time) => (
                    <button
                        key={time}
                        onClick={() => {
                            setSelectedShowtime(time);
                            setStep(3);
                        }}
                        className={`p-4 text-center rounded-md ${selectedShowtime === time ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                    >
                        {time}
                    </button>
                ))}
            </div>
        </div>
    );

    const SeatingLayout = () => (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{t('selectSeats')}</h2>
            <div className="mb-8 bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-center gap-8 mb-4">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
                        <span>{t('available')}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
                        <span>{t('selected')}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-600 rounded mr-2"></div>
                        <span>{t('booked')}</span>
                    </div>
                </div>
                <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto">
                    {seats.map((seat) => (
                        <button
                            key={seat.id}
                            onClick={() => handleSeatSelection(seat)}
                            disabled={seat.isBooked}
                            className={`p-2 rounded flex items-center justify-center ${seat.isBooked ? "bg-red-600 text-white cursor-not-allowed" : selectedSeats.find(s => s.id === seat.id) ? "bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
                        >
                            <FaChair className="text-lg" />
                        </button>
                    ))}
                </div>
            </div>
            {selectedSeats.length > 0 && (
                <button
                    onClick={() => setStep(4)}
                    className="w-full max-w-xs mx-auto block bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
                >
                    {t('confirmSelection')} ({selectedSeats.length} {t('seats')})
                </button>
            )}
        </div>
    );

    const BookingConfirmation = () => (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">{t('bookingSummary')}</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">{t('movie')}:</span>
                        <span>{selectedMovie.title}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">{t('showtime')}:</span>
                        <span>{selectedShowtime}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">{t('seats')}:</span>
                        <span>{selectedSeats.map(seat => seat.id).join(", ")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">{t('totalSeats')}:</span>
                        <span>{selectedSeats.length}</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        alert(t('bookingConfirmed'));
                        setStep(1);
                        setSelectedMovie(null);
                        setSelectedShowtime(null);
                        setSelectedSeats([]);
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-md mt-8 hover:bg-green-700 transition duration-300"
                >
                    {t('confirmBooking')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto">
                {step === 1 && <MovieSelection />}
                {step === 2 && <ShowtimeSelection />}
                {step === 3 && <SeatingLayout />}
                {step === 4 && <BookingConfirmation />}
            </div>
        </div>
    );
};

export default MovieTicketBooking;