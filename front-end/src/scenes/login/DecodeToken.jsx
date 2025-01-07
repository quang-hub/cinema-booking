import { jwtDecode } from "jwt-decode";

export const getDecodedToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Hàm lấy danh sách permissions
export const getPermissions = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken || !decodedToken.permissions) return [];

  // Tách chuỗi permissions thành một mảng
  return decodedToken.permissions.split(" ");
};

export const hasPermission = (permission) => {
    const permissionsArray = getPermissions(); // Lấy danh sách permissions từ token
    return permissionsArray.includes(permission); // Kiểm tra xem quyền có trong danh sách không
  };

  export const getUserCode = () => {
    const decodedToken = getDecodedToken();
    return decodedToken?.code ? decodedToken.code : ""; // Kiểm tra xem quyền có trong danh sách không
  };

// Hàm lấy danh sách permissions
export const getFullName = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken || !decodedToken.fullName) return "";
  return decodedToken.fullName;
};

export const getSub = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken || !decodedToken.sub) return "";
  return decodedToken.sub;
};
