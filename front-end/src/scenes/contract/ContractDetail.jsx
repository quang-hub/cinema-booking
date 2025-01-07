import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import FileTable from "../files/FileTable";
import InfoTable from "./InforTable";
import AreaContract from "./AreaContract";
import { refreshToken } from "../../components/RefreshToken";
import ManageHistory from "../history/ManageHistory";
import Axios from "../../components/Axios";
import { hasPermission } from "../login/DecodeToken";
const ContractDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [basicInfo, setBasicInfo] = useState({});

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <InfoTable basicInfo={basicInfo} />;
      case "files":
        return <FilesTable contractCode={code} />;
      case "area_contract":
        return <AreaContract basicInfo={basicInfo} />;
      case "history":
        return <HistoryTable contractCode={code} />;
      default:
        return null;
    }
  };
  const fetchDataFile = () => {};
  useEffect(() => {
    if (activeTab === "info") {
      fetchDataBasic();
    }
    if (activeTab === "files") {
      fetchDataFile();
    }
    if (activeTab === "area_contract") {
      // fetchDataFile();
    }
    if (activeTab === "history") {
      // fetchDataFile();
    }
  }, [activeTab]);

  const fetchDataBasic = async () => {
    let authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.error("Token không tồn tại.");
      window.location.href = "/login"; // Điều hướng về trang đăng nhập
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

  

    console.log("Request body:", code); // Log để kiểm tra payload

    try {
      let response = await Axios.get(`/contract/get-detail/${code}`, { headers });

      // Kiểm tra lỗi 401 (token hết hạn)
      if (response.status === 401) {
        console.log("Access token hết hạn. Đang làm mới...");

        const refreshed = await refreshToken(); // Gọi hàm refresh token

        if (refreshed) {
          // Lấy token mới và cập nhật headers
          authToken = localStorage.getItem("authToken");
          headers.Authorization = `Bearer ${authToken}`;

          // Gửi lại request sau khi làm mới token
         response = await Axios.get(`/contract/get-detail/${code}`, { headers });
        } else {
          console.log("Refresh token không hợp lệ. Chuyển đến login.");
          window.location.href = "/login";
          return;
        }
      }

      const data = response.data;
      setBasicInfo(data.data); // Cập nhật state với dữ liệu hợp đồng
    } catch (error) {
      console.error("Error fetching contract detail:", error);
    }
  };

  useEffect(() => {
    fetchDataBasic(); // Gọi hàm khi component được mount
  }, [code]);

  return (
    <div className="p-4">
      <Button
        color="primary"
        variant="contained"
        sx={{ backgroundColor: colors.blueAccent[700] }}
        onClick={() => navigate(-1)} // Quay lại trang trước
        className="mb-4 flex items-center px-4 py-2 text-white rounded"
      >
        <ArrowBackIcon className="mr-2" /> {/* Biểu tượng back */}
        Trở Về
      </Button>
      {/* <h1 className="text-xl font-bold text-center">Thông tin chi tiết của khu công nghiệp {id}</h1> */}
      {/* Có thể thêm logic để hiển thị tên KCN dựa trên id nếu cần */}

      <div className="flex justify-center mb-6 space-x-4">
        <Button
          variant={activeTab === "info" ? "contained" : "outlined"}
          color="primary"
          sx={{
            backgroundColor:
              activeTab === "info"
                ? colors.blueAccent[500]
                : colors.blueAccent[700],
            color: "white",
            "&:hover": {
              backgroundColor: colors.blueAccent[500],
            },
          }}
          onClick={() => setActiveTab("info")}
        >
          Chi tiết hợp đồng
        </Button>

        {hasPermission("UPLOAD_FILE_CONTRACT") && (
          <Button
          variant={activeTab === "files" ? "contained" : "outlined"}
          color="primary"
          sx={{
            backgroundColor:
              activeTab === "files"
                ? colors.blueAccent[500]
                : colors.blueAccent[700],
            color: "white",
            "&:hover": {
              backgroundColor: colors.blueAccent[500],
            },
          }}
          onClick={() => setActiveTab("files")}
        >
          File đính kèm
        </Button>
        )}
        

        {hasPermission("UPDATE_CONTRACT") && (
          <Button
            variant={activeTab === "area_contract" ? "contained" : "outlined"}
            color="primary"
            sx={{
              backgroundColor:
                activeTab === "area_contract"
                  ? colors.blueAccent[500]
                  : colors.blueAccent[700],
              color: "white",
              "&:hover": {
                backgroundColor: colors.blueAccent[500],
              },
            }}
            onClick={() => setActiveTab("area_contract")}
          >
            Hợp đồng khu đất
          </Button>
        )}
        
        <Button
          variant={activeTab === "history" ? "contained" : "outlined"}
          color="primary"
          sx={{
            backgroundColor:
              activeTab === "history"
                ? colors.blueAccent[500]
                : colors.blueAccent[700],
            color: "white",
            "&:hover": {
              backgroundColor: colors.blueAccent[500],
            },
          }}
          onClick={() => setActiveTab("history")}
        >
          Lịch sử thay đổi
        </Button>
      </div>

      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

// const InfoTable = ({ basicInfo}) => (
//   <div>
//     <h2 className="text-lg font-semibold">Thông tin chi tiết hợp đồng</h2>
//     <InforTable />
//   </div>
// );

const HistoryTable = ({ contractCode, id }) => (
  <div>
    <h2 className="text-lg font-semibold">
      Xem lịch sử thay đổi của hợp đồng{" "}
    </h2>

    <ManageHistory code={contractCode} type={"contract"} id={id} />
  </div>
);

const FilesTable = ({ contractCode }) => (
  <div>
    <h2 className="text-lg font-semibold">File hợp đồng đính kèm </h2>
    <FileTable code={contractCode} type={"CONTRACT"} />
  </div>
);

export default ContractDetails;
