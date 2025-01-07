import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Axios from "../../components/Axios";

const AreaState = ({ defaultColors = ["#88de7e", "#ed4f3e"], parkCode }) => {
  const theme = useTheme();
  const token = localStorage.getItem("authToken") || "";
  const [total, setTotal] = useState(0);
  const [dataArea, setDataArea] = useState([]);

  const fetchDataAreaState = async () => {
    try {
      const url = `/dash-board/area-by-state`;
      const requestData = {
        industrialParkCode: parkCode,
        page: 1,
        size: 10000,
      };
      const response = await Axios.post(url, requestData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data.data;
      const formattedData = responseData.listAreas.map((item) => ({
        name: item.keyCode === "LEASED" ? "Đã cho thuê" : "Chưa cho thuê",
        value: parseInt(item.value),
      }));

      setDataArea(formattedData);
      

      const totalValue = formattedData.reduce((acc, item) => acc + item.value, 0);
      setTotal(totalValue);
      console.log(totalValue);
      
    } catch (error) {
      console.error("Error fetching area data:", error);
    }
  };

  useEffect(() => {
    fetchDataAreaState();
  }, [parkCode]);
    console.log(total);

  // Apply conditional styles based on theme mode
  const isDarkMode = theme.palette.mode === "dark";
  const backgroundColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";

  return (
    <div >
      <div className={`${backgroundColor} shadow-lg rounded-lg p-6`}>
        <h2 className={`text-lg font-bold mb-4 ${textColor}`}>
          Thống kê theo trạng thái khu đất
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center">
            <div
              className="w-5 h-5 border-2 rounded mr-2"
              style={{ backgroundColor: defaultColors[0] }}
            ></div>
            <span className={`text-sm ${textColor}`}>Đã cho thuê</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-5 h-5 border-2 rounded mr-2"
              style={{ backgroundColor: defaultColors[1] }}
            ></div>
            <span className={`text-sm ${textColor}`}>Chưa cho thuê</span>
          </div>
        </div>
        {total !== 0 ? (
          <div className="w-full h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
                  data={dataArea}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {dataArea.map((entry) => {
                    const color =
                      entry.name === "Đã cho thuê"
                        ? defaultColors[0] // Màu xanh
                        : defaultColors[1]; // Màu đỏ
                    return <Cell key={`cell-${entry.name}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const percentage = ((value / total) * 100).toFixed(2);
                    return (
                      <>
                        <div>Trạng thái: {value}</div>
                        <div>Tỷ lệ: {percentage}%</div>
                      </>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
              <span className={`font-black text-xl ${textColor}`}>{total}</span>
              <span className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tổng
              </span>
            </div>
          </div>
        ) : (
          <div className={textColor}>Chưa có dữ liệu</div>
        )}
      </div>
    </div>
  );
};

export default AreaState;
