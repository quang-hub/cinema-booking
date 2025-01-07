import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const isAuthenticated = !!localStorage.getItem("authToken"); // Kiểm tra token trong localStorage
  
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };
  

export default PrivateRoute;