import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, useTheme } from "@mui/material";
import Area from "../area/ManageArea";
import { tokens } from "../../theme";
import Axios from "../../components/Axios";
import ManageImage from "../image/ManageImage";
import FileTable from "../files/FileTable"
import ManageHistory from "../history/ManageHistory";
import DeleteBackUpTable from "./DeleteBackUpTable";
import UpdateBackUpTable from "./UpdateBackUpTable";
import { Typography, Paper, Grid, Container } from "@mui/material";
import QuillViewer from './QuillViewer';
import { hasPermission } from "../login/DecodeToken";
import BackupTable from './BackupTable';

const IndustrialParkDetails = () => {
  const token = localStorage.getItem("authToken") || "";

  const { code, id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [basicInfo, setBasicInfo] = useState({});

  useEffect(() => {
    // Check for permission when component mounts
    if (!(hasPermission("VIEW_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK") || hasPermission("MANAGE_AREA"))) {
      navigate("/dashboard"); // or redirect to any other page
    }
  }, [navigate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <InfoTable basicInfo={basicInfo} parkId={code} />;
      case "area":
        return <AreaTable parkCode={code} parkId={id} />;
      case "files":
        return <FilesTable parkId={code} />;
      case "history":
        return <HistoryTable parkId={code} id={id} />
      case "delete":
        return <DeleteTable parkId={code} />
      case "update":
        return <UpdateTable parkId={code} />
      case "backup":
          return <BackupTableDelete parkId={code} />
      default:
        return null;
    }
  };
  const getTab = (label, value, permission) => {
    return hasPermission(permission) ? { label, value } : null;
  };

  const fetchDataFile = () => {

  }
  useEffect(() => {
    if (activeTab === 'info') {
      fetchDataBasic();
    }
    if (activeTab === 'area') {
      // fetchDataArea();
    }
    if (activeTab === 'files') {
      fetchDataFile();
    }
    if (activeTab === 'history') {
      // fetchDataFile();
    }
  }, [activeTab]);


  const fetchDataBasic = async () => {
    try {
      const url = `/industrial-park/search?code=${code}&page=1&size=10`;

      const response = await Axios.get(url, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      setBasicInfo(response.data.data.data[0]);

    } catch (error) {
      console.error('Error fetching scenes:', error);
    }

  };
  const tabs = [
    { label: "Thông Tin", value: "info" },
    { label: "Khu đất", value: "area" },
    { label: "Lịch sử thay đổi", value: "history" },
    { label: "File khác", value: "files" },
    getTab("Lịch sửa xóa ảnh", "delete", "VIEW_SCENE"),
    { label: "Bản lưu backups sửa", value: "update" },
    { label: "Bản lưu backups", value: "backup" },
  ].filter(Boolean);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        color="primary"
        variant="contained"
        onClick={() => navigate(-1)}
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: colors.blueAccent[700],
          '&:hover': {
            backgroundColor: colors.blueAccent[800],
          }
        }}
      >
        <ArrowBackIcon />
        Trở Về
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{
          fontWeight: 'bold',
          color: colors.grey[100],
          mb: 4
        }}>
          Thông tin chi tiết của khu công nghiệp {basicInfo.name || id}
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 4
        }}>
          {tabs.map((tab, index) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "contained" : "outlined"}
              onClick={() => setActiveTab(tab.value)}
              sx={{
                backgroundColor: activeTab === tab.value
                  ? colors.blueAccent[500]
                  : 'transparent',
                color: activeTab === tab.value
                  ? 'white'
                  : colors.blueAccent[300],
                borderColor: colors.blueAccent[300],
                '&:hover': {
                  backgroundColor: colors.blueAccent[500],
                  color: 'white'
                },
                minWidth: '150px'
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

const InfoTable = ({ basicInfo, parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Thông tin cơ bản của khu công nghiệp
    </Typography>

    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} >
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Mã:</Typography>
              <Typography>{basicInfo.code}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Tên:</Typography>
              <Typography>{basicInfo.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Diện tích:</Typography>
              <Typography>{basicInfo.square}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>Miêu tả:</Typography>
              {/* <Typography> */}
              <QuillViewer htmlContent={basicInfo.description} />

              {/* </Typography> */}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {(hasPermission("VIEW_SCENE") || hasPermission("MANAGE_INDUSTRIAL_PARK"))&&
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quản lý ảnh</Typography>
            <ManageImage parkId={parkId} />
          </Paper>
        </Grid>
      }

    </Grid>
  </Box>
);


const AreaTable = ({ parkCode, parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Khu công nghiệp
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <Area code={parkCode} parkId={parkId} />
    </Paper>
  </Box>
);

const HistoryTable = ({ parkId, id }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Lịch sử thay đổi
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <ManageHistory code={parkId} type={"industrialPark"} id={id} />
    </Paper>
  </Box>
);

const FilesTable = ({ parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      File của khu công nghiệp
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <FileTable type={"INDUSTRIAL_PARK"} code={parkId} />
    </Paper>
  </Box>
);

const DeleteTable = ({ parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Bản lưu backup đã xóa
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <DeleteBackUpTable code={parkId} />
    </Paper>
  </Box>
);

const UpdateTable = ({ parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Bản lưu backup đã cập nhật
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <UpdateBackUpTable code={parkId} />
    </Paper>
  </Box>
);

const BackupTableDelete = ({ parkId }) => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Bản lưu backup
    </Typography>
    <Paper elevation={2} sx={{ p: 3 }}>
      <BackupTable code={parkId} />
    </Paper>
  </Box>
);

export default IndustrialParkDetails;
