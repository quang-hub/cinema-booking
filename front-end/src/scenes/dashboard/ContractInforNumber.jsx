import React, { useState, useEffect } from "react";
import { useTheme, Typography, Card, CardContent } from "@mui/material";
import Axios from "../../components/Axios";
import { CheckCircle, Cancel } from "@mui/icons-material";
import Notification from "../../components/Notification";

const ContractInforNumber = ({ parkCode }) => {
  const theme = useTheme();
  const [contractData, setContractData] = useState(null); // Dữ liệu hợp đồng từ API
  const authToken = localStorage.getItem("authToken");

  // Fetch contract data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = { parkCode };
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        };

        const response = await Axios.post(
          `/dash-board/statistics-contract?industrialParkCode=${parkCode}`,
          body,
          { headers }
        );
        setContractData(response.data.data); // Save data in state
        console.log(response.data.data);
      } catch (err) {
        console.error(err);
        Notification("Có lỗi xảy ra", "ERROR");
      }
    };

    if (parkCode) {
      fetchData(); // Fetch data if parkCode exists
    }
  }, [authToken, parkCode]);

  // Conditional background and text color based on the theme mode
  const isDarkMode = theme.palette.mode === "dark";
  const backgroundColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const isDataValid =
    contractData &&
    (contractData.numIsExpired !== null || contractData.numProcess !== null);

  return (
    <div>
      <Card
        style={{ backgroundColor: isDarkMode ? "#1F2937" : "#ffffff" }}
        className="shadow-lg rounded-lg p-6 w-full"
      >
        <CardContent>
          <Typography variant="h5" className={`font-bold mb-4 ${textColor}`}>
            Hợp Đồng
          </Typography>

          {/* If no contract data */}
          {!isDataValid ? (
            <Typography variant="h6" className={`text-gray-500 ${textColor}`}>
              Không có dữ liệu hợp đồng.
            </Typography>
          ) : (
            <>
              {/* Total number of contracts */}
              <div className="mb-4">
                <Typography variant="h6" className={textColor}>
                  Tổng số hợp đồng:{" "}
                  {contractData.numIsExpired + contractData.numProcess}
                </Typography>
              </div>

              {/* Active contracts */}
              <div
                className={`rounded-lg p-4 mb-4 flex justify-between items-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <Typography variant="body1" className="text-green-500">
                  Hợp đồng còn hạn: {contractData.numProcess}
                </Typography>
                <CheckCircle className="text-green-500" />
              </div>

              {/* Expired contracts */}
              <div
                className={`rounded-lg p-4 flex justify-between items-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <Typography variant="body1" className="text-red-500">
                  Hợp đồng hết hạn: {contractData.numIsExpired}
                </Typography>
                <Cancel className="text-red-500" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractInforNumber;
