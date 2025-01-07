import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import RuleIcon from "@mui/icons-material/Rule";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DescriptionIcon from "@mui/icons-material/Description";
import { hasPermission, getFullName, getSub } from "../login/DecodeToken";

const data = [
  {
    image: "https://via.placeholder.com/150",
    countryFlag: "https://via.placeholder.com/24", // Replace with actual flag URL
    code: "HLC001",
    address: "Ngo 15 Duy Tan, Cau Giay, Ha Noi, Vietnam",
    contact: "Hungddt2 - 035 315 1414",
    stats: [
      { label: "Buildings", value: 12 },
      { label: "Floors", value: 148 },
      { label: "Rooms", value: 1049 },
      { label: "Lots", value: 2014 },
    ],
  },
  // Add more entries as needed
];


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState("");
  
  useEffect(() => {
    setFullName(getFullName());
    setUser(getSub());
  }, []);
  
  const displayName = fullName && fullName.trim() !== "" ? fullName : ""; // Kiểm tra và gán giá trị hiển thị
  
  const displayUsername = user && user.trim() != "" ? user : "";
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {displayName}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/avatar.jpg`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  VBee360
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {displayUsername}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Báo cáo"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Đổi mật khẩu"
              to="/change-password"
              icon={<PermIdentityIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Dữ liệu
            </Typography>
            {(hasPermission("VIEW_INDUSTRIAL_PARK") ||
              hasPermission("MANAGE_INDUSTRIAL_PARK") || hasPermission("MANAGE_AREA")) && (
              <Item
                title="Quản lý khu công nghiệp"
                to="/industrial-park"
                icon={<FormatListBulletedOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {(hasPermission("VIEW_HOTSPOT_RESOURCE") || hasPermission("MANAGE_INDUSTRIAL_PARK"))&& (
              <>
                <Item
                  title="Quản lý icon"
                  to="/manage-icon"
                  icon={<DescriptionIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Quản lý video"
                  to="/manage-video"
                  icon={<DescriptionIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            )}
            {hasPermission("VIEW_ACCOUNT") && (
              <Item
                title="Quản lý tài khoản"
                to="/user"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            {hasPermission("VIEW_PERMISSION") && (
              <Item
                title="Quản lý quyền hạn"
                to="/manage-permission"
                icon={<RuleIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            {hasPermission("VIEW_ROLE") && (
              <Item
                title="Quản lý chức vụ"
                to="/manage-role"
                icon={<ManageAccountsIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            {(hasPermission("MANAGE_INDUSTRIAL_PARK") ||
              hasPermission("VIEW_CONTRACT")) && (
              <Item
                title="Quản lý hợp đồng"
                to="/manage-contract"
                icon={<DescriptionIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            <Item
              title="Quản lý log"
              to="/manage-history"
              icon={<DescriptionIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* <Item
              title="Contacts Information"
              to="/contacts"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}

            {/* <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography Chart"
              to="/geography"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
