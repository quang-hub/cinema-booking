import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";

const Card = ({ data }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Determine theme-based styles
  const isDarkMode = theme.palette.mode === "dark";
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-gray-700";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const badgeColor = isDarkMode ? "bg-red-500" : "bg-red-600";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-500";
  const gridBgColor = isDarkMode ? "bg-gray-700" : "bg-gray-100";

  const handleClick = () => {
    navigate(`/dashboard/${data.code}`, { state: { name: data.name } });
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer w-full max-w-sm mx-auto border ${borderColor} rounded-lg shadow-lg p-4 ${bgColor}`}
    >
      <div className="flex items-center mb-4">
        <img
          src={data.image}
          alt="Thumbnail"
          className="w-24 h-24 rounded mr-4"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${badgeColor} text-white`}
            >
              {data.name}
            </span>
            <span className={`text-xs ${subTextColor}`}>{data.code}</span>
          </div>
          <p className={`text-sm font-semibold ${textColor}`}>
            Tổng diện tích: {data.square}(ha)
          </p>
          <p className={`text-sm font-semibold ${textColor}`}>
            Vị trí: {data.address}
          </p>
          <p className={`text-xs ${subTextColor}`}>
            {data.userCode} - {data.userPhone}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4 text-center text-sm">
        <div className={`${gridBgColor} p-2 rounded`}>
          <span className={`block font-bold ${textColor}`}>
            {data.quantityOfScene}
          </span>
          <span className={`text-xs ${subTextColor}`}>Ảnh</span>
        </div>
        <div className={`${gridBgColor} p-2 rounded`}>
          <span className={`block font-bold ${textColor}`}>
            {data.quantityOfArea}
          </span>
          <span className={`text-xs ${subTextColor}`}>Khu đất</span>
        </div>
        <div className={`${gridBgColor} p-2 rounded`}>
          <span className={`block font-bold ${textColor}`}>
            {data.quantityOfContract}
          </span>
          <span className={`text-xs ${subTextColor}`}>Hợp đồng</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
