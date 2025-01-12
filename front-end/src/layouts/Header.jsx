import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

const Header = () => {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState("en");
    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage); // Thay đổi ngôn ngữ
        setLanguage(selectedLanguage);
        localStorage.setItem("language", selectedLanguage); // Lưu ngôn ngữ vào localStorage
    };

    return (
        <div>
            <header className="flex items-center justify-between p-4 bg-[#0f1621] text-white">
                {/* Logo Section */}
                <div className="logo">
                    <img src="./assets/login_background.jpeg" alt="Cinestar Logo" className="h-10" />
                </div>

                {/* Buttons Section */}
                <div className="flex gap-4">
                    <button className="px-4 py-2 text-sm font-bold bg-yellow-400 text-black rounded-md">
                        🎟️ BUY TICKETS
                    </button>
                    <button className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-md">
                        🍿 BUY POPCORN
                    </button>
                </div>

                {/* Search Section */}
                <div className="flex items-center bg-white rounded-full overflow-hidden">
                    <input
                        type="text"
                        className="px-4 py-2 text-sm text-black outline-none"
                        placeholder="Find movies, theaters"
                    />
                    <button className="px-4 text-black">🔍</button>
                </div>

                {/* User Actions Section */}
                <div className="flex items-center gap-6">
                    <a className="text-sm" href="/login">👤 Sign in</a>
                    <div className="flex items-center gap-1 cursor-pointer">
                        <select
                            className="bg-black text-white p-2 rounded"
                            value={language}
                            onChange={handleLanguageChange}
                        >
                            <option value="en">English</option>
                            <option value="vn">Vietnamese</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Outlet for rendering child routes */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Header;
