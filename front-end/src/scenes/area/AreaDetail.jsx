import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Axios from "../../components/Axios";

import FileTable from "../files/FileTable";
import ManageHistory from "../history/ManageHistory";
import { Typography, Paper, Grid, Container } from "@mui/material";
import AreaContractInPass from "./AreaContractInPass";
import InfoTable from "../contract/InforTable";
import { refreshToken } from "../../components/RefreshToken";
import { hasPermission } from "../login/DecodeToken";

const AreaDetails = () => {
  const token = localStorage.getItem("authToken") || "";

  const { parkCode, parkId, areaCode, areaId } = useParams(); // Lấy id từ URL

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [basicInfo, setBasicInfo] = useState({});
  const [basicInfoContract, setBasicInfoContract] = useState({});

  useEffect(() => {
    // Check for permission when component mounts
    if (!(hasPermission("VIEW_AREA") || hasPermission("MANAGE_AREA"))) {
      navigate("/dashboard"); // or redirect to any other page
    }
  }, [navigate]);

  const fetchDataBasicContract = async () => {
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

    try {
      let response = await Axios.get(
        `/contract/get-detail-by-area?area=${areaCode}&industrialParkCode=${parkCode}`,
        { headers }
      );

      // Nếu gặp lỗi 401, thử làm mới token
      if (response.status === 401) {
        console.log("Access token hết hạn. Đang làm mới...");

        const refreshed = await refreshToken();

        if (refreshed) {
          authToken = localStorage.getItem("authToken");
          headers.Authorization = `Bearer ${authToken}`; // Cập nhật token

          response = await Axios.get(
            `/contract/get-detail-by-area?area=${areaCode}&industrialParkCode=${parkCode}`,
            { headers }
          );
        } else {
          console.log("Refresh token không hợp lệ. Chuyển đến login.");
          window.location.href = "/login";
          return;
        }
      }

      const data = response.data;
      setBasicInfoContract(data.data); // Cập nhật state với dữ liệu hợp đồng
    } catch (error) {
      console.error("Error fetching contract detail:", error);
    }
  };


  useEffect(() => {
    fetchDataBasicContract(); // Call function when component mounts
  }, [areaCode, parkCode]); // Add dependencies if these values are dynamic

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <InforTable
            basicInfo={basicInfo}
            parkCode={parkCode}
            basicInfoContract={basicInfoContract}
          />
        );
      case "contract":
        return <ContractTable areaCode={areaCode} />;
      case "files":
        return <FilesTable parkCode={parkCode} code={areaCode} />;
      case "history":
        return <HistoryTable areaCode={areaCode} areaId={areaId} />;
      default:
        return null;
    }
  };
  useEffect(() => {
    if (activeTab === "info") {
      fetchDataBasic();
    }
  }, [activeTab]);

  const fetchDataBasic = async () => {
    try {
      const url = `/area/search?industrialParkCode=${parkCode}&code=${areaCode}&page=1&size=10`;

      const response = await Axios.get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data.data.data[0]);

      setBasicInfo(response.data.data.data[0]);
    } catch (error) {
      console.error("Error fetching scenes:", error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        color="primary"
        variant="contained"
        onClick={() => navigate(-1)}
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: colors.blueAccent[700],
          "&:hover": {
            backgroundColor: colors.blueAccent[800],
          },
        }}
      >
        <ArrowBackIcon />
        Trở Về
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: colors.grey[100],
            mb: 4,
          }}
        >
          Thông tin chi tiết của khu đất {basicInfo.code || ""}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            mb: 4,
          }}
        >
          {[
            { label: "Thông Tin", value: "info" },
            { label: "Hợp đồng cũ", value: "contract" },
            { label: "File khác", value: "files" },
            { label: "Lịch sử thay đổi", value: "history" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "contained" : "outlined"}
              onClick={() => setActiveTab(tab.value)}
              sx={{
                backgroundColor:
                  activeTab === tab.value
                    ? colors.blueAccent[500]
                    : "transparent",
                color:
                  activeTab === tab.value ? "white" : colors.blueAccent[300],
                borderColor: colors.blueAccent[300],
                "&:hover": {
                  backgroundColor: colors.blueAccent[500],
                  color: "white",
                },
                minWidth: "150px",
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        {renderTabContent()}
      </Paper>
    </Container>
  );
};

const InforTable = ({ basicInfo, parkCode, basicInfoContract }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Thông tin cơ bản của khu đất
    </Typography>

    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: "100px" }}>
                Mã:
              </Typography>
              <Typography>{basicInfo.code}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: "100px" }}>
                Tên:
              </Typography>
              <Typography>{basicInfo.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: "100px" }}>
                Diện tích:
              </Typography>
              <Typography>{basicInfo.square}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: "100px" }}>
                Miêu tả:
              </Typography>
              <Typography>{basicInfo.description}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: "100px" }}>
                Nguời quản lý:
              </Typography>
              <Typography>{basicInfo.userCode}</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hợp đồng hiện tại
          </Typography>
          {basicInfoContract ? (
            <InfoTable basicInfo={basicInfoContract} />
          ) : (
            <p>Chưa có hợp đồng</p>
          )}
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

const ContractTable = ({ areaCode }) => (
  <div>
    <h2 className="text-lg font-semibold">Khu đất {areaCode}</h2>
    <AreaContractInPass />
  </div>
);

const FilesTable = ({ parkCode, code }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      File của khu công nghiệp
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <FileTable type={"AREA"} code={code} industrialParkCode={parkCode} />
    </Paper>
  </Box>
);

const HistoryTable = ({ areaCode, areaId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Lịch sử thay đổi của khu đất {areaCode}
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <ManageHistory type={"area"} id={areaId} />
    </Paper>
  </Box>
);

export default AreaDetails;
