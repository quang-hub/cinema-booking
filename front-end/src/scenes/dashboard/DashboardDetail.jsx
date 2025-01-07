import React from "react";
import { useParams } from "react-router-dom";
import AreaSquare from "./AreaSquareChart";
import ContractInforNumber from "./ContractInforNumber";
import AreaState from "./AreaStateChart";
import ContractArea from "./ContractAreaChart";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DashboardDetail = () => {
  const token = localStorage.getItem("authToken") || "";
  
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { parkCode } = useParams();
  const location = useLocation();
  const name = location.state ? location.state.name : "";

  const defaultColors = [
    "#bdd7ff",
    "#3388ff",
    "#ffbdff",
    "#eb24eb",
    "#8ef3f6",
    "#31e8e5",
    "#10c5cb",
    "#c2bdff",
    "#7e74fb",
    "#5547f5",
    "#ffc399",
    "#fc8d40",
    "#f37216",
    "#ff6699",
    "#ff9966",
    "#ffcc99",
    "#ffcc00",
    "#ff6600",
    "#ff3300",
    "#cc0066",
    "#9900cc",
    "#6600ff",
    "#0099ff",
    "#3399ff",
    "#66ccff",
    "#66ff99",
    "#33cc33",
    "#66cc00",
    "#99cc33",
    "#339966",
    "#3366cc",
    "#6633cc",
    "#9900cc",
    "#660066",
    "#6600cc",
    "#ff33cc",
    "#ff6699",
    "#ff0033",
    "#66ffcc",
    "#66cc99",
    "#cc66ff",
    "#ff33cc",
    "#ff9966",
    "#ffcc66",
    "#ff66cc",
    "#ff3333",
    "#cccccc",
    "#ffb3b3",
    "#ffccff",
    "#b3e0ff",
    "#b3ffcc",
    "#ffb366",
    "#ffb3e0",
    "#e066ff",
    "#c2f0c2",
    "#ffcccc",
    "#ff9966",
    "#ff6699",
    "#ff9966",
    "#b3ffb3",
    "#ff3366",
    "#00cc99",
    "#66ccff",
    "#ff6633",
    "#ff3399",
    "#ff3366",
    "#ff9966",
    "#ff6666",
    "#ffcc33",
    "#ff6600",
    "#ff00cc",
    "#3399ff",
    "#ff33cc",
    "#33ccff",
    "#ff0066",
    "#ffccff",
    "#ff6666",
    "#ccff99",
    "#66ccff",
    "#ff6600",
    "#ff0033",
    "#6600cc",
    "#ff99cc",
    "#cc99ff",
    "#ccff66",
    "#ff9933",
    "#ff0066",
    "#33ff99",
    "#6666ff",
    "#00ffcc",
    "#6666cc",
    "#00ccff",
    "#cc66ff",
    "#ff66cc",
    "#33cc66",
    "#ff99cc",
    "#ff0033",
    "#cc33ff",
    "#ff6699",
    "#00ff66",
    "#ff6600",
    "#ffcc33",
    "#ff9933",
    "#cc3399",
    "#ff3399",
    "#ff00cc",
    "#ff0066",
    "#ff9966",
    "#3366cc",
    "#33cc99",
  ];


  return (
    <>
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
      <h1 className="text-2xl font-bold mb-6">
        Bản thống kê của khu công nghiệp {name}
      </h1>
      <div className="flex flex-col gap-8">

        {/* Hàng 1 */}
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
          <div className="flex-1">
            <ContractInforNumber parkCode={parkCode} />
          </div>
          <div className="flex-1">
            <ContractArea defaultColors={defaultColors} parkCode={parkCode} />
          </div>
        </div>

        {/* Hàng 2 */}
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
          <div className="flex-1">
            <AreaSquare defaultColors={defaultColors} parkCode={parkCode} />
          </div>
          <div className="flex-1">
            <AreaState parkCode={parkCode} />
          </div>
        </div>
      </div>
      <br /><br />

    </>
  );
};

export default DashboardDetail;
