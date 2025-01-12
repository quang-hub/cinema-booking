import React, { useState } from "react";

const DayPicker = () => {
    // Lấy ngày hiện tại
    const today = new Date();
    // State để lưu trữ ngôn ngữ ("vi-VN" hoặc "en-US")
    const [locale, setLocale] = useState(localStorage.getItem("language") === "en" ? "en-US" : "vi-VN");

    // Tạo danh sách 7 ngày (từ ngày hiện tại)
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(today.getDate() + index);
        return {
            day: date.getDate(),
            weekday:
                index === 0
                    ? locale === "vi-VN"
                        ? "Hôm nay"
                        : "Today"
                    : date.toLocaleDateString(locale, { weekday: "short" }),
            isToday: index === 0,
            fullDate: date.toLocaleDateString(locale),
        };
    });

    // State để lưu trữ ngày được chọn
    const [selectedDay, setSelectedDay] = useState(days[0]);

    const handleSelectDay = (day) => {
        setSelectedDay(day);
    };

    const toggleLocale = () => {
        setLocale((prevLocale) => (prevLocale === "vi-VN" ? "en-US" : "vi-VN"));
    };

    return (
        <div>

            {/* Hiển thị danh sách ngày */}
            <div className="flex space-x-2 p-4 overflow-x-auto">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center justify-center px-4 py-2 border rounded-lg cursor-pointer ${selectedDay.day === day.day
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-white text-gray-700 border-gray-300"
                            }`}
                        onClick={() => handleSelectDay(day)}
                    >
                        <div
                            className={`text-lg font-bold ${selectedDay.day === day.day ? "text-white" : "text-black"
                                }`}
                        >
                            {day.day}
                        </div>
                        <div
                            className={`text-sm ${selectedDay.day === day.day ? "text-white" : "text-gray-500"
                                }`}
                        >
                            {day.weekday}
                        </div>
                    </div>
                ))}
            </div>

            {/* Nội dung hiển thị theo ngày được chọn */}
            <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                <h2 className="text-lg font-bold">Ngày được chọn:</h2>
                <p>
                    <strong>Ngày:</strong> {selectedDay.day}
                </p>
                <p>
                    <strong>Thứ:</strong> {selectedDay.weekday}
                </p>
                <p>
                    <strong>Ngày đầy đủ:</strong> {selectedDay.fullDate}
                </p>
            </div>
        </div>
    );
};

export default DayPicker;