import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Notification from "../../components/Notification";
import Axios from "../../components/Axios";
import dayjs from "dayjs"; // Import dayjs
import React, { useEffect, useState, useCallback } from "react";
import { refreshToken } from "../../components/RefreshToken";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

const Form = ({ selectedContract, refresh, onCloseForm, formikRef }) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const authToken = localStorage.getItem("authToken");
  const [industrialParks, setIndustrialParks] = useState([]);

  console.log("Selected Contract:", selectedContract);
  // Hàm xử lý gửi biểu mẫu
  const handleFormSubmit = async (values) => {
    console.log(selectedContract);

    try {
      // Chuyển đổi ngày tháng trước khi gửi
      const formattedValues = {
        ...values,
        startDate: dayjs(values.startDate).format("ss:mm:HH DD-MM-YYYY"), // Chỉnh sửa
        endDate: dayjs(values.endDate).format("ss:mm:HH DD-MM-YYYY"), // Chỉnh sửa
      };

      console.log("Submitting values:", formattedValues);

      if (selectedContract) {
        await updateContract(formattedValues);
      } else {
        await createContract(formattedValues);
      }
      refresh(); // Chỉ gọi khi không có lỗi
    } catch (error) {
      console.error("Error submitting form:", error); // In lỗi
    }
  };

  const fetchIndustrialParks = useCallback(async () => {
    const page = 1; // Set the page value
    const size = 1000; // Set the size value

    try {
      // Make the request to fetch industrial parks
      let response = await Axios.get(
        `/industrial-park/search?page=${page}&size=${size}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Include the token in the headers
          },
        }
      );
      // Directly use the response if it is successful
      setIndustrialParks(response.data.data.data || []); // Store the industrial parks data in state
    } catch (error) {
      // Check if the error is due to an expired token
      if (error.response && error.response.status === 401) {
        // Token expired, need to refresh
        const refreshed = await refreshToken(); // Call the refresh token function

        if (refreshed) {
          const newToken = localStorage.getItem("authToken"); // Get the new token from localStorage

          // Retry the request with the new token
          try {
            const retryResponse = await Axios.get(
              `/industrial-park/search?page=${page}&size=${size}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${newToken}`, // Include the new token in the headers
                },
              }
            );
            setIndustrialParks(retryResponse.data.data.data || []); // Store the industrial parks data in state
          } catch (retryError) {
            console.error(
              "Error fetching industrial parks on retry:",
              retryError
            );
            setIndustrialParks([]); // Reset to an empty array on error
          }
        } else {
          console.error("Could not refresh token. Redirecting to login.");
          window.location.href = "/login"; // Redirect to the login page if the token could not be refreshed
        }
      } else {
        console.error("Error fetching industrial parks:", error);
        setIndustrialParks([]); // Reset to an empty array on error
      }
    }
  }, [authToken]); // Include authToken as a dependency

  // Gọi API ngay khi component được render
  useEffect(() => {
    fetchIndustrialParks();
  }, [fetchIndustrialParks]);

  // Hàm tạo hợp đồng mới
  const createContract = async (values) => {
    try {
      const response = await Axios.post("/contract/add", values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token

        if (refreshed) {
          const newToken = localStorage.getItem("authToken");

          // Thử lại yêu cầu với token mới
          try {
            const retryResponse = await Axios.post("/contract/add", values, {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            if (retryResponse.data.code === 200) {
              const message = retryResponse.data.message;
              Notification(message, "SUCCESS"); // Thông báo thành công
              onCloseForm();
            } else {
              const message = retryResponse.data.message;
              Notification(message, "ERROR"); // Thông báo lỗi
            }
          } catch (retryError) {
            const message =
              retryError.response?.data?.message ||
              "Đã xảy ra lỗi khi tạo hợp đồng";
            Notification(message, "ERROR"); // Thông báo lỗi
            throw retryError;
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập nếu không thể làm mới token
        }
      } else {
        const message = response.data.message;
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo hợp đồng";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const updateContract = async (values) => {
    try {
      console.log(values); // Kiểm tra xem values có đúng và không rỗng
      const response = await Axios.post("/contract/edit", values, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Kiểm tra mã code trả về từ API
      if (response.data.code === 200) {
        const message = response.data.message;
        Notification(message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
      } else if (response.data.code === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token

        if (refreshed) {
          const newToken = localStorage.getItem("authToken");

          // Thử lại yêu cầu với token mới
          try {
            const retryResponse = await Axios.post("/contract/edit", values, {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            if (retryResponse.data.code === 200) {
              const message = retryResponse.data.message;
              Notification(message, "SUCCESS"); // Thông báo thành công
              onCloseForm();
            } else {
              const message = retryResponse.data.message;
              Notification(message, "ERROR"); // Thông báo lỗi
            }
          } catch (retryError) {
            const message =
              retryError.response?.data?.message ||
              "Đã xảy ra lỗi khi cập nhật hợp đồng";
            Notification(message, "ERROR"); // Thông báo lỗi
            throw retryError;
          }
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập nếu không thể làm mới token
        }
      } else {
        const message = response.data.message;
        Notification(message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hợp đồng";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };
  const phoneRegExp = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

  const checkoutSchema = yup.object().shape({
    industrialParkCode: yup.string().required("Bắt buộc"),
    name: yup
      .string()
      .max(255, "Không được vượt quá 255 ký tự")
      .required("Phải nhập trường này"),
    code: yup
      .string()
      .max(255, "Không được vượt quá 255 ký tự")
      .required("Phải nhập trường này"),
    startDate: yup
      .date()
      .typeError("Ngày/Tháng/Năm bắt đầu không hợp lệ") // Custom message for invalid date
      .required("Phải nhập trường này"),
    endDate: yup
      .date()
      .typeError("Ngày/Tháng/Năm kết thúc không hợp lệ") // Custom message for invalid date
      .required("Phải nhập trường này"),
    description: yup.string().max(1000, "Mô tả không được vượt quá 1000 ký tự"),
    contractDetail: yup.object().shape({
      lessor: yup
        .string()
        .max(255, "Không được vượt quá 255 ký tự")
        .required("Phải nhập trường này"),
      representativeLessor: yup
        .string()
        .max(255, "Không được vượt quá 255 ký tự")
        .required("Phải nhập trường này"),
      lessorPhone: yup
        .string()
        .required("Phải nhập trường này")
        .matches(phoneRegExp, "Số điện thoại không hợp lệ !"),
      lessee: yup
        .string()
        .max(255, "Không được vượt quá 255 ký tự")
        .required("Phải nhập trường này"),
      representativeLessee: yup
        .string()
        .max(255, "Không được vượt quá 255 ký tự")
        .required("Phải nhập trường này"),
      lesseePhone: yup
        .string()
        .max(255, "Không được vượt quá 255 ký tự")
        .required("Phải nhập trường này"),
    }),
  });

  const initialValues = {
    name: selectedContract?.name || "",
    code: selectedContract?.code || "",
    newCode: selectedContract?.newCode || "",
    description: selectedContract?.description || "",
    industrialParkCode: selectedContract?.industrialParkCode || "",
    startDate: selectedContract?.startDate
      ? dayjs(selectedContract.startDate).format("YYYY-MM-DDTHH:mm:ss")
      : "",
    endDate: selectedContract?.endDate
      ? dayjs(selectedContract.endDate).format("YYYY-MM-DDTHH:mm:ss")
      : "",
    contractDetail: {
      lessor: selectedContract?.contractDetail?.lessor || "",
      representativeLessor:
        selectedContract?.contractDetail?.representativeLessor || "",
      lessorPhone: selectedContract?.contractDetail?.lessorPhone || "",
      lessee: selectedContract?.contractDetail?.lessee || "",
      representativeLessee:
        selectedContract?.contractDetail?.representativeLessee || "",
      lesseePhone: selectedContract?.contractDetail?.lesseePhone || "",
    },
  };

  return (
    <Box m="20px">
      <Header
        title={selectedContract ? "SỬA HỢP ĐỒNG" : "TẠO HỢP ĐỒNG"}
        subtitle={
          selectedContract ? "Sửa thông tin hợp đồng" : "Tạo hợp đồng mới"
        }
      />

      <Formik
        innerRef={formikRef} // Gán formikRef vào Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues} // Nếu có value, form sẽ tự động điền
        validationSchema={checkoutSchema}
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
                    Tên hợp đồng <span style={{ color: "red" }}>(*)</span>
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
                    Mã hợp đồng <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.code}
                name="code"
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                disabled={!!selectedContract} // Khóa khi chỉnh sửa
                sx={{ gridColumn: "span 4" }}
              />

              {/* Mã mới (Chỉ hiển thị khi chỉnh sửa hợp đồng) */}
              {selectedContract && (
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={
                    <span>
                      Mã mới <span style={{ color: "red" }}>(*)</span>
                    </span>
                  }
                  required
                  onBlur={handleBlur}
                  onChange={(event) =>
                    setFieldValue("newCode", event.target.value)
                  }
                  value={values.newCode || values.code}
                  name="newCode"
                  error={!!touched.newCode && !!errors.newCode}
                  helperText={touched.newCode && errors.newCode}
                  sx={{ gridColumn: "span 4" }}
                />
              )}
              
                <FormControl
                  fullWidth
                  variant="filled"
                  error={
                    !!touched.industrialParkCode && !!errors.industrialParkCode
                  }
                  sx={{ gridColumn: "span 4" }}
                  disabled={!!selectedContract}
                >
                  <InputLabel>
                    Tên khu công nghiệp{" "}
                    <span style={{ color: "red" }}>(*)</span>
                  </InputLabel>
                  <Select
                    name="industrialParkCode"
                    value={values.industrialParkCode} // giá trị được gán ở đây
                    onBlur={handleBlur}
                    onChange={(event) => {
                      setFieldValue("industrialParkCode", event.target.value);
                    }}
                  >
                    {industrialParks.length !== 0 &&
                      industrialParks.map((park) => (
                        <MenuItem key={park.code} value={park.code}>
                          {park.name} {/* Hiển thị tên của khu công nghiệp */}
                        </MenuItem>
                      ))}
                  </Select>
                  {touched.industrialParkCode && errors.industrialParkCode && (
                    <FormHelperText>{errors.industrialParkCode}</FormHelperText>
                  )}
                </FormControl>
              

              <TextField
                fullWidth
                variant="filled"
                type="datetime-local"
                label={
                  <span>
                    Ngày bắt đầu <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.startDate}
                name="startDate"
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 4" }}
                InputLabelProps={{
                  shrink: true, // Đảm bảo nhãn không bị trùng với giá trị trong input
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="datetime-local"
                label={
                  <span>
                    Ngày kết thúc <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.endDate}
                name="endDate"
                error={!!touched.endDate && !!errors.endDate}
                helperText={touched.endDate && errors.endDate}
                sx={{ gridColumn: "span 4" }}
                InputLabelProps={{
                  shrink: true, // Đảm bảo nhãn không bị trùng với giá trị trong input
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Mô tả"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Bên cho thuê <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.lessor}
                name="contractDetail.lessor"
                error={
                  !!touched.contractDetail?.lessor &&
                  !!errors.contractDetail?.lessor
                }
                helperText={
                  touched.contractDetail?.lessor &&
                  errors.contractDetail?.lessor
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Đại diện bên cho thuê{" "}
                    <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.representativeLessor}
                name="contractDetail.representativeLessor"
                error={
                  !!touched.contractDetail?.representativeLessor &&
                  !!errors.contractDetail?.representativeLessor
                }
                helperText={
                  touched.contractDetail?.representativeLessor &&
                  errors.contractDetail?.representativeLessor
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    SĐT bên cho thuê <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.lessorPhone}
                name="contractDetail.lessorPhone"
                error={
                  !!touched.contractDetail?.lessorPhone &&
                  !!errors.contractDetail?.lessorPhone
                }
                helperText={
                  touched.contractDetail?.lessorPhone &&
                  errors.contractDetail?.lessorPhone
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Bên thuê <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.lessee}
                name="contractDetail.lessee"
                error={
                  !!touched.contractDetail?.lessee &&
                  !!errors.contractDetail?.lessee
                }
                helperText={
                  touched.contractDetail?.lessee &&
                  errors.contractDetail?.lessee
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Đại diện bên thuê <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.representativeLessee}
                name="contractDetail.representativeLessee"
                error={
                  !!touched.contractDetail?.representativeLessee &&
                  !!errors.contractDetail?.representativeLessee
                }
                helperText={
                  touched.contractDetail?.representativeLessee &&
                  errors.contractDetail?.representativeLessee
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    SĐT bên thuê <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contractDetail.lesseePhone}
                name="contractDetail.lesseePhone"
                error={
                  !!touched.contractDetail?.lesseePhone &&
                  !!errors.contractDetail?.lesseePhone
                }
                helperText={
                  touched.contractDetail?.lesseePhone &&
                  errors.contractDetail?.lesseePhone
                }
                sx={{ gridColumn: "span 4" }}
              />
            </Box>

            {/* <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {selectedContract ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Box> */}
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
