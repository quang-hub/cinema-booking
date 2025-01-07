import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useEffect, useState, useCallback } from "react";
import Axios from "../../components/Axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Notification from "../../components/Notification";
import { refreshToken } from "../../components/RefreshToken";
import { hasPermission } from "../login/DecodeToken";
const Form = ({ selectedUser, refresh, onCloseForm, formikRef }) => {
  // Định nghĩa các hàm gọi API ở đây
  const authToken = localStorage.getItem("authToken");
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); // Đặt loading thành true để hiển thị vòng tròn tải khi bắt đầu

  const fetchRolesData = useCallback(async () => {
    setLoading(true);
    const rolesData = await fetchRoles();
    setRoles(rolesData);
    setLoading(false);
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await Axios.post(
        "/sys-role/search",
        {
          pageSize: 1000,
          pageIndex: 1,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log(response.data);
      return response.data.data.content || [];
    } catch (error) {
      // Kiểm tra lỗi 401 tại đây
      if (error.response?.status === 401) {
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          try {
            const response = await Axios.post(
              "/sys-role/search",
              {
                pageSize: 1000,
                pageIndex: 1,
              },
              {
                headers: { Authorization: `Bearer ${newAuthToken}` },
              }
            );

            console.log(response.data);
            return response.data.data.content || [];
          } catch (retryError) {
            console.error(
              "Error fetching roles after token refresh:",
              retryError
            );
            return [];
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
        }
      } else {
        console.error("Error fetching roles:", error);
        return [];
      }
    }
  };

  const updateUser = async (userId, updatedValues) => {
    try {
      delete updatedValues.password;

      const response = await Axios.post(
        `/sys-user/${userId}/update`,
        updatedValues,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // Kiểm tra mã phản hồi từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        // Xử lý trường hợp token hết hạn tại đây
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          const retryResponse = await Axios.post(
            `/sys-user/${userId}/update`,
            updatedValues,
            {
              headers: { Authorization: `Bearer ${newAuthToken}` },
            }
          );

          if (retryResponse.data.code === 200) {
            const message = retryResponse.data.message;
            Notification(message, "SUCCESS"); // Thông báo thành công
            onCloseForm();
          } else {
            const message = retryResponse.data.message;
            Notification(message, "ERROR"); // Thông báo lỗi
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
        }
      } else {
        const message = response.data.message;
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Đã xảy ra lỗi khi cập nhật người dùng";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const createUser = async (updatedValues) => {
    try {
      updatedValues["roleIds"] = updatedValues.listRoleIds;

      const response = await Axios.post("/sys-user/create", updatedValues, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        // Xử lý trường hợp token hết hạn tại đây
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          const retryResponse = await Axios.post(
            "/sys-user/create",
            updatedValues,
            {
              headers: { Authorization: `Bearer ${newAuthToken}` },
            }
          );

          if (retryResponse.data.code === 200) {
            const message = retryResponse.data.message;
            Notification(message, "SUCCESS"); // Thông báo thành công
            onCloseForm();
          } else {
            const message = retryResponse.data.message;
            Notification(message, "ERROR"); // Thông báo lỗi
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
        }
      } else {
        const message = response.data.message;
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo người dùng";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, [fetchRolesData]);

  const handleFormSubmit = async (values) => {
    const formattedDob = values.dob
      ? dayjs(values.dob).format("YYYY-MM-DD")
      : null;

    const roleIds = values.roles.map((role) => role).filter(Boolean);

    const updatedValues = {
      ...values,
      dob: formattedDob,
      listRoleIds: roleIds,
    };

    console.log("Creating user with values:", updatedValues);

    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, updatedValues);
      } else {
        console.log(updatedValues);
        await createUser(updatedValues);
      }
      refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const initialValues = {
    fullName: selectedUser?.fullName || "",
    email: selectedUser?.email || "",
    password: selectedUser?.password || "", // Không gán giá trị mật khẩu khi chỉnh sửa
    userName: selectedUser?.userName || "",
    phone: selectedUser?.phone || "",
    code: selectedUser?.code || "",
    roles: selectedUser?.roles.map((role) => role.id) || [], // Lấy các ID của roles hiện tại
    dob: selectedUser?.dob ? dayjs(selectedUser.dob) : new Date(),
  };
  const phoneRegExp = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/

  const checkoutSchema = yup.object().shape({
    fullName: yup.string().required("Phải nhập trường này"),
    email: yup.string().email().required("Phải nhập trường này"),
    userName: yup
      .string()
      .max(255, "Không vượt quá 255 ký tự")
      .required("Phải nhập trường này"),
    password: !selectedUser
      ? yup.string().required("Phải nhập trường này")
      : yup.string().nullable(),
      phone: yup.string().required("Phải nhập trường này").matches(phoneRegExp, 'Số điện thoại không hợp lệ !'),
      code: yup.string().required("Phải nhập trường này").max(255, "Không được vượt quá 255 ký tự"),
    roles: yup.array().min(1, "Cần chọn ít nhất 1 chức vụ"),
    dob: yup.date().required("Phải nhập trường này").typeError("Ngày/Tháng/Năm bắt đầu không hợp lệ"),
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box m="20px">
        <Header
          title={selectedUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
          subtitle={selectedUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
        />
        <Formik
          innerRef={formikRef} // Gán formikRef vào Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={checkoutSchema}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
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
                  type="text"
                  label={
                    <span>
                      Tên tài khoản <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.userName}
                  name="userName"
                  error={!!touched.userName && !!errors.userName}
                  helperText={touched.userName && errors.userName}
                  sx={{ gridColumn: "span 2" }}
                  disabled={selectedUser ? true : false}
                />
                {!selectedUser && (
                  <TextField
                    fullWidth
                    variant="filled"
                    type="password"
                    label={
                      <span>
                        Mật khẩu <span style={{ color: "red" }}>(*)</span>
                      </span>
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    sx={{ gridColumn: "span 2" }}
                  />
                )}
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={
                    <span>
                      Email <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={
                    <span>
                      Tên <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.fullName}
                  name="fullName"
                  error={!!touched.fullName && !!errors.fullName}
                  helperText={touched.fullName && errors.fullName}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={
                    <span>
                      Số điện thoại <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phone}
                  name="phone"
                  error={!!touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={
                    <span>
                      Mã số <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.code}
                  name="code"
                  error={!!touched.code && !!errors.code}
                  helperText={touched.code && errors.code}
                  sx={{ gridColumn: "span 4" }}
                  disabled={selectedUser ? true : false}
                />
                {loading ? (
                  <CircularProgress sx={{ gridColumn: "span 4" }} />
                ) : (
                  <FormControl
                    fullWidth
                    variant="filled"
                    sx={{ gridColumn: "span 4" }}
                  >
                    <InputLabel id="role-select-label">
                      <span>
                        Chức vụ <span style={{ color: "red" }}>(*)</span>
                      </span>
                    </InputLabel>
                    <Select
                      labelId="role-select-label"
                      multiple
                      value={values.roles || []} // Đảm bảo là mảng
                      onChange={(event) => {
                        const {
                          target: { value },
                        } = event;
                        setFieldValue("roles", value); // Cập nhật mảng các role ID đã chọn
                      }}
                      onBlur={handleBlur}
                      error={!!touched.roles && !!errors.roles}
                      renderValue={(selected) => {
                        const selectedRoles = roles.filter((role) =>
                          selected.includes(role.id)
                        );
                        return selectedRoles
                          .map((role) => role.name)
                          .join(", ");
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 300,
                          },
                        },
                        MenuListProps: {
                          sx: {
                            maxHeight: 150,
                            overflowY: "auto",
                            "& .MuiMenuItem-root": {
                              backgroundColor: "transparent", // Màu nền mặc định
                              "&:hover": {
                                backgroundColor: "lightblue",
                                color: "black !important",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#4CCEAC !important",
                                color: "black !important",
                              },
                            },
                          },
                        },
                        // Thêm style cho Select component
                        sx: {
                          color: (theme) =>
                            theme.palette.mode === "light" ? "black" : "white", // Thay đổi màu chữ dựa trên theme
                        },
                      }}
                    >
                      {roles.map((role) => (
                        <MenuItem
                          key={role.id}
                          value={role.id}
                          sx={{
                            backgroundColor: values.roles.includes(role.id)
                              ? "#4CCEAC"
                              : "transparent", // Màu nền đã chọn
                            color: values.roles.includes(role.id)
                              ? "black"
                              : (theme) =>
                                  theme.palette.mode === "light"
                                    ? "black"
                                    : "white", // Màu chữ dựa trên theme
                            "&:hover": {
                              backgroundColor: values.roles.includes(role.id)
                                ? "#4CCEAC"
                                : "lightblue", // Màu nền khi di chuột
                            },
                          }}
                        >
                          {role.name}{" "}
                          {/* Sử dụng trường 'name' thay vì 'roleName' */}
                        </MenuItem>
                      ))}
                    </Select>

                    {touched.roles && errors.roles && (
                      <div style={{ color: "red" }}>{errors.roles}</div>
                    )}
                  </FormControl>
                )}
                <DatePicker
                  label={
                    <span>
                      Ngày tháng năm sinh (Tháng/Ngày/Năm){" "}
                      <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  value={values.dob}
                  onChange={(newValue) => setFieldValue("dob", newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      variant="filled"
                      onBlur={handleBlur}
                      error={!!touched.dob && !!errors.dob}
                      helperText={touched.dob && errors.dob}
                      sx={{ gridColumn: "span 4" }} // Đặt span thành 4
                    />
                  )}
                />
              </Box>
              {/* <Box display="flex" justifyContent="end" mt="20px">
                {(selectedUser
                  ? hasPermission("UPDATE_ACCOUNT")
                  : hasPermission("CREATE_ACCOUNT")) && (
                  <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    sx={{ width: "100px" }}
                  >
                    {selectedUser ? "Chỉnh sửa" : "Thêm"}
                  </Button>
                )}
              </Box> */}
            </form>
          )}
        </Formik>
      </Box>
    </LocalizationProvider>
  );
};

export default Form;
