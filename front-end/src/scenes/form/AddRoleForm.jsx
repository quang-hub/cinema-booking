import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import { refreshToken } from "../../components/RefreshToken";

const Form = ({ selectedRoles, refresh, onCloseForm, formikRef }) => {
  const authToken = localStorage.getItem("authToken");
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const handleFormSubmit = async (values) => {
    try {
      if (selectedRoles) {
        await updateRole(selectedRoles.id, values);
      } else {
        await createRole(values);
      }
      refresh(); // Chỉ gọi khi không có lỗi
    } catch (error) {
      console.error("Error submitting form:", error); // In lỗi
    }
  };

  const checkoutSchema = yup.object().shape({
    name: yup.string().required("Phải nhập trường này").max(255, "Không được vượt quá 255 ký tự"),
    code: yup.string().required("Phải nhập trường này").max(255, "Không được vượt quá 255 ký tự"),
    note: yup.string().max(1000, "Không được vượt quá 1000 ký tự"),
  });

  const initialValues = {
    name: selectedRoles?.name || "",
    code: selectedRoles?.code || "",
    note: selectedRoles?.note || "",
  };

  const createRole = async (values) => {
    try {
      const response = await Axios.post("/sys-role/create", values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        // Token hết hạn, gọi hàm làm mới token
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          try {
            const response = await Axios.post("/sys-role/create", values, {
              headers: { Authorization: `Bearer ${newAuthToken}` },
            });

            // Kiểm tra mã code trả về từ API
            if (response.data.code === 200) {
              const message = response.data.message;
              Notification(message, "SUCCESS"); // Thông báo thành công
              onCloseForm();
            } else {
              const message = response.data.message;
              Notification(message, "ERROR"); // Thông báo lỗi
            }
          } catch (error) {
            const message =
              error.response?.data?.message || "Đã xảy ra lỗi khi tạo vai trò!";
            Notification(message, "ERROR"); // Thông báo lỗi
            throw error;
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
        }
      } else {
        const message =
          response.data.message || "Đã xảy ra lỗi khi tạo vai trò!";
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo vai trò!";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const updateRole = async (id, values) => {
    try {
      const response = await Axios.post(`/sys-role/${id}/update`, values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        // Token hết hạn, gọi hàm làm mới token
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          const retryResponse = await Axios.post(
            `/sys-role/${id}/update`,
            values,
            { headers: { Authorization: `Bearer ${newAuthToken}` } }
          );

          // Kiểm tra mã code trả về từ API
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
        const message =
          response.data.message || "Đã xảy ra lỗi khi cập nhật vai trò!";
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật vai trò!";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  console.log(initialValues);
  return (
    <Box m="20px">
      <Header
        title={selectedRoles ? "Sửa chức vụ" : "Tạo chức vụ"}
        subtitle={selectedRoles ? "Sửa chức vụ" : "Tạo chức vụ mới"}
      />

      <Formik
        innerRef={formikRef} // Gán formikRef vào Formik
        onSubmit={handleFormSubmit}
        initialValues={selectedRoles || initialValues} // Nếu có role, form sẽ tự động điền
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
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
                    Tên chức vụ <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Mã chức vụ <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.code}
                name="code"
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={<span>Ghi chú</span>}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.note}
                name="note"
                error={!!touched.note && !!errors.note}
                helperText={touched.note && errors.note}
                sx={{ gridColumn: "span 4" }}
              />

              {touched.files && errors.files && (
                <Box sx={{ color: "red", gridColumn: "span 4" }}>
                  {errors.files}
                </Box>
              )}
            </Box>
            {/* <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {selectedRoles ? "Update Role" : "Create Role"}
              </Button>
            </Box> */}
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
