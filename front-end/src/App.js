import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './scenes/login/login';
import ForgotPass from './scenes/forgotPass/forgotPasword';
import Dashboard from './scenes/dashboard';
import ManageUser from './scenes/user/ManageUser';
import IndustrialPark from './scenes/industrialPark/ManageIndustrialPark';
import Invoices from './scenes/invoices';
import Contacts from './scenes/contacts';
import Bar from './scenes/bar';
import Line from './scenes/line';
import Pie from './scenes/pie';
import FAQ from './scenes/faq';
import Geography from './scenes/geography';
import Calendar from './scenes/calendar/calendar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/Loading';
import IndustrialParkDetails from './scenes/industrialPark/IndustrialParkDetail';
import Error404 from './scenes/404/404';
import ManagePermission from './scenes/user/ManagePermission';
import Home from './scenes/krpanoHome/home';
import ManageRole from './scenes/user/ManageRole';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import AreaDetail from "./scenes/area/AreaDetail";
import PasswordChangeForm from './scenes/form/ChangePassUserForm';
import ManageHistoryPark from './scenes/history/ManageHistory';
import ManageContract from './scenes/contract/ManageContract';
import ContractDetails from './scenes/contract/ContractDetail';
import PanoBackup from './scenes/krpanoHome/PanoBackup';
import ManageIcon from './scenes/icon/ManageIcon';
import ManageVideo from './scenes/icon/ManageVideo';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardDetail from './scenes/dashboard/DashboardDetail';
import './i18n'; // Import the i18n setup
import Header from './layouts/Header';

function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogoutEvent = () => {
      navigate('/login');  // Redirect to login
    };

    // Listen for the logout event
    window.addEventListener('logoutToken', handleLogoutEvent);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('logoutToken', handleLogoutEvent);
    };
  }, [navigate]);

  // Tạo theme riêng không có dark mode cho trang Authentication và trang 404
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <>

      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 999999 }}
            toastStyle={{ borderRadius: "10px" }}
          />

          <Routes>
            {/* Điều hướng mặc định tới trang login */}
            <Route path="/" element={<Navigate to="/home" />} />

            {/* Layout cho trang Authentication, sử dụng lightTheme */}
            <Route
              element={
                <Header />
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPass />} />
              <Route path="/loading" element={<Loader />} />
            </Route>
            <Route path='/backupScene' element={<PanoBackup />} />
            {/* Layout cho trang admin, được bảo vệ bởi PrivateRoute */}
            <Route element={<PrivateRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:parkCode" element={<DashboardDetail />} />
                <Route path="/user" element={<ManageUser />} />
                <Route
                  path="/manage-permission"
                  element={<ManagePermission />}
                />
                <Route path="/manage-role" element={<ManageRole />} />
                <Route path="/industrial-park" element={<IndustrialPark />} />
                <Route
                  path="/industrial-park/:code/:id"
                  element={<IndustrialParkDetails />}
                />
                <Route
                  path="/industrial-park/:parkCode/:parkId/:areaCode/:areaId"
                  element={<AreaDetail />}
                />

                <Route path="/contacts" element={<Contacts />} />


                <Route path="/manage-icon" element={<ManageIcon />} />
                <Route path="/manage-video" element={<ManageVideo />} />

                <Route path="/manage-history" element={<ManageHistoryPark />} />

                <Route path="/invoices" element={<Invoices />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/geography" element={<Geography />} />
                <Route
                  path="/change-password"
                  element={<PasswordChangeForm />}
                />
                <Route path="/manage-contract" element={<ManageContract />} />
                <Route
                  path="/manage-contract/:code/:parkCode"
                  element={<ContractDetails />}
                />
              </Route>
            </Route>

            {/* Route cho trang 404, sử dụng lightTheme */}
            <Route
              path="*"
              element={
                <ThemeProvider theme={lightTheme}>
                  <CssBaseline />
                  <Error404 />
                </ThemeProvider>
              }
            />
          </Routes>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}

export default App;
