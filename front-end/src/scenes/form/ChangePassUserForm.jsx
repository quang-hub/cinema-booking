import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Notification from "../../components/Notification";
import { useState } from "react";
import { refreshToken } from "../../components/RefreshToken";
import Axios from "../../components/Axios";
const PasswordChangeForm = ({ rowData }) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  // const [loading, setLoading] = useState(false); // Quản lý trạng thái loading


const handleFormSubmit = async (values, { resetForm }) => {
  // setLoading(true); // Bắt đầu loading
  try {
    let token = localStorage.getItem("authToken");
    if (!token) throw new Error("Token không tồn tại.");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    let response = await Axios.post("/sys-user/change-password", values, { headers });

    // Kiểm tra mã 401
    if (response.status === 401) {
      console.log("Access token hết hạn. Đang làm mới...");
      const refreshed = await refreshToken(); // Hàm làm mới token

      if (refreshed) {
        token = localStorage.getItem("authToken");
        headers.Authorization = `Bearer ${token}`; // Cập nhật token mới vào headers
        // Gọi lại hàm với token mới
        response = await Axios.post("/sys-user/change-password", values, { headers });
      } else {
        console.log("Refresh token không hợp lệ. Chuyển đến login.");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }
    }

    if (response.data.code === 200) {
      Notification(response.data.message || "Thay đổi mật khẩu thành công!", "SUCCESS");
      resetForm();
    } else {
      Notification(response.data.message || "Đã xảy ra lỗi khi đổi mật khẩu.", "ERROR");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    Notification("Có lỗi xảy ra. Vui lòng thử lại sau.", "ERROR");
  }
  // finally {
  //   setLoading(false); // Kết thúc loading
  // }
};


  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Box width="50%">
        {" "}
        <Header
          title={rowData ? "EDIT PASSWORD" : "Đổi mật khẩu"}
          subtitle={
            rowData ? "Edit Your Password" : "Thay đổi mật khẩu của bạn"
          }
          sx={{ textAlign: "left", mb: "20px" }}
        />
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={rowData || initialValues}
          validationSchema={checkoutSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            resetForm,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="password"
                  label="Mật khẩu hiện tại"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.oldPassword}
                  name="oldPassword"
                  error={!!touched.oldPassword && !!errors.oldPassword}
                  helperText={touched.oldPassword && errors.oldPassword}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="password"
                  label="Mật khẩu mới"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.newPassword}
                  name="newPassword"
                  error={!!touched.newPassword && !!errors.newPassword}
                  helperText={touched.newPassword && errors.newPassword}
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="password"
                  label="Nhập lại mật khẩu mới"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.reNewPassword}
                  name="reNewPassword"
                  error={!!touched.reNewPassword && !!errors.reNewPassword}
                  helperText={touched.reNewPassword && errors.reNewPassword}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {rowData ? "Update Password" : "Lưu thay đổi"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  oldPassword: yup.string().required("Nhập mật khẩu hiện tại"),
  newPassword: yup.string().required("Nhập mật khẩu mới"),
  reNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Mật khẩu không khớp")
    .required("Nhập lại mật khẩu mới"),
});

const initialValues = {
  oldPassword: "",
  newPassword: "",
  reNewPassword: "",
};

export default PasswordChangeForm;
