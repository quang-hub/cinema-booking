import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Notification from "../../components/Notification";
import Axios from "../../components/Axios";
import { refreshToken } from "../../components/RefreshToken";

const Form = ({ selectedPermission, refresh, onCloseForm, formikRef }) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const authToken = localStorage.getItem("authToken");
  console.log("Selected Permission:", selectedPermission);

  const handleFormSubmit = async (values) => {
    try {
      if (selectedPermission) {
        await updatePermission(selectedPermission.id, values);
      } else {
        await createPermission(values);
      }
      refresh(); // Chỉ gọi khi không có lỗi
    } catch (error) {
      console.error("Error submitting form:", error); // In lỗi
    }
  };

  const createPermission = async (values) => {
    try {
      // Gọi API để tạo quyền
      const response = await Axios.post("/sys-permission/create", values, {
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
          // Nếu làm mới thành công, lấy token mới từ localStorage
          const newAuthToken = localStorage.getItem("authToken");

          // Gọi lại API với token mới
          try {
            const retryResponse = await Axios.post(
              "/sys-permission/create",
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
          } catch (error) {
            const message =
              error.response?.data?.message || "Lỗi khi gọi lại API!";
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
        const message = response.data.message || "Đã xảy ra lỗi!";
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message = error.response?.data?.message || "Đã xảy ra lỗi!";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const updatePermission = async (id, values) => {
    try {
      // Gọi API để cập nhật quyền
      const response = await Axios.post(
        `/sys-permission/${id}/update`,
        values,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        // Token hết hạn, gọi hàm làm mới token
        const refreshed = await refreshToken();

        if (refreshed) {
          // Nếu làm mới thành công, lấy token mới từ localStorage
          const newAuthToken = localStorage.getItem("authToken");

          // Gọi lại API với token mới
          const retryResponse = await Axios.post(
            `/sys-permission/${id}/update`,
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
        const message = response.data.message || "Đã xảy ra lỗi!";
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message = error.response?.data?.message || "Đã xảy ra lỗi!";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const checkoutSchema = yup.object().shape({
    name: yup.string().required("Phải nhập trường này").max(255, "Không được vượt quá 255 ký tự"),
    code: yup.string().required("Phải nhập trường này").max(255, "Không được vượt quá 255 ký tự"),
    note: yup.string().max(1000, "Không được vượt quá 1000 ký tự"),
  });

  const initialValues = {
    name: selectedPermission?.name || "",
    code: selectedPermission?.code || "",
    note: selectedPermission?.note || "",
  };

  return (
    <Box m="20px">
      <Header
        title={selectedPermission ? "SỬA QUYỀN HẠN" : "TẠO QUYỀN HẠN"}
        subtitle={
          selectedPermission ? "Sửa dữ liệu quyền hạn" : "Tạo quyền hạn mới"
        }
      />

      <Formik
        innerRef={formikRef} // Gán formikRef vào Formik
        onSubmit={handleFormSubmit}
        initialValues={selectedPermission || initialValues} // Nếu có value, form sẽ tự động điền
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
                    Tên quyền hạn <span style={{ color: "red" }}>(*)</span>
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
                    Mã quyền hạn <span style={{ color: "red" }}>(*)</span>
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

              {/* <TextField
                fullWidth
                type="file"
                onChange={(event) => {
                  setFieldValue("files", event.currentTarget.files);
                }}
                inputProps={{ multiple: true }}
                name="files"
                sx={{ gridColumn: "span 4" }}
              /> */}

              {touched.files && errors.files && (
                <Box sx={{ color: "red", gridColumn: "span 4" }}>
                  {errors.files}
                </Box>
              )}
            </Box>
            {/* <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {selectedPermission ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Box> */}
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
