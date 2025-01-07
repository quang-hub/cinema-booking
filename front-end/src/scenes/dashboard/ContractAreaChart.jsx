import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@mui/material";
import Axios from "../../components/Axios";

const ContractArea = ({ defaultColors, parkCode }) => {
  const theme = useTheme();
  const token = localStorage.getItem("authToken") || "";

  const [dataArea, setDataArea] = useState([]);
  const [total, setTotal] = useState();
  const [showAll, setShowAll] = useState(false);

  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  const itemsToShow = showAll ? dataArea : dataArea.slice(0, 12);

  const fetchDataAreaSquare = async () => {
    try {
      const url = `/dash-board/statistics-area-contract?industrialParkCode=${parkCode}`;
      const requestData = {};

      const response = await Axios.post(url, requestData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data;
      const formattedData = responseData.data.listAreas.map((entry) => ({
        keyCode: entry.keyCode,
        value: parseFloat(entry.value),
      }));

      setDataArea(formattedData);
      const totalValue = formattedData.reduce((acc, area) => acc + parseFloat(area.value), 0);
      setTotal(totalValue);
    } catch (error) {
      console.error("Error fetching scenes:", error);
    }
  };

  useEffect(() => {
    fetchDataAreaSquare();
  }, []);

  // Apply conditional styles based on theme mode
  const isDarkMode = theme.palette.mode === "dark";
  const backgroundColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div>
      {/* Biểu đồ 1 */}
      <div className={`${backgroundColor} shadow-lg rounded-lg p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${textColor}`}>
            Thống kê số khu đất có trong hợp đồng
          </h2>
        </div>

        {/* Danh sách tiêu đề và màu sắc thẳng hàng */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {dataArea &&
            dataArea.length !== 0 &&
            itemsToShow.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-5 h-5 border-2 rounded mr-2 ${borderColor}`}
                  style={{ backgroundColor: defaultColors[index % defaultColors.length] }}
                ></div>
                <span className={`text-sm ${textColor}`}>
                  {entry.keyCode} <span className="font-semibold">({entry.value})</span>
                </span>
              </div>
            ))}

          {dataArea.length > 15 && (
            <div className="col-span-full text-center mt-4">
              <button
                onClick={handleShowMore}
                className="text-blue-500 hover:underline"
              >
                {showAll ? "Thu gọn" : "Hiển thị thêm"}
              </button>
            </div>
          )}
        </div>

        {dataArea && dataArea.length !== 0 ? (
          <>
            <div className="w-full h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataArea}
                    dataKey="value"
                    nameKey="keyCode"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {dataArea.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={defaultColors[index % defaultColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                className={`absolute flex flex-col items-center justify-center`}
                style={{ zIndex: 10 }}
              >
                <span className={`font-black text-xl ${textColor}`}>{total}</span>
                <span
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tổng
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className={textColor}>Chưa có dữ liệu</div>
        )}
      </div>
    </div>
  );
};

export default ContractArea;
