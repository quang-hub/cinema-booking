import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Notification from "../../components/Notification";
import Axios from "../../components/Axios";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { refreshToken } from "../../components/RefreshToken";

const Form = ({ refresh, onCloseForm,formikRef }) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const authToken = localStorage.getItem("authToken");
  const { parkCode, code } = useParams(); // Lấy mã công viên & mã hợp đồng từ URL

  const [areaOptions, setAreaOptions] = useState([]); // Lưu danh sách khu vực

  // Lấy danh sách khu vực chưa có hợp đồng
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await Axios.get(
          `/area/get-area-not-in-contract?industrialParkCode=${parkCode}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
  
        if (response.data.code === 200) {
          setAreaOptions(response.data.data); // Lưu dữ liệu khu vực
        } else if (response.data.code === 401) {
          // Xử lý trường hợp token hết hạn tại đây
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error("Không thể làm mới token. Điều hướng tới trang đăng nhập.");
            window.location.href = "/login"; // Điều hướng tới trang đăng nhập
          } else {
            const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới
            // Gọi lại API với token mới
            const retryResponse = await Axios.get(
              `/area/get-area-not-in-contract?industrialParkCode=${parkCode}`,
              { headers: { Authorization: `Bearer ${newAuthToken}` } }
            );
            if (retryResponse.data.code === 200) {
              setAreaOptions(retryResponse.data.data); // Lưu dữ liệu khu vực
            } else {
              Notification("Lỗi khi lấy danh sách khu vực!", "ERROR");
            }
          }
        } else {
          Notification("Lỗi khi lấy danh sách khu vực!", "ERROR");
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
        Notification("Không thể lấy dữ liệu khu vực!", "ERROR");
      }
    };
  
    fetchAreas();
  }, [parkCode, authToken]);
  

  // Thêm khu vực vào hợp đồng
  const addAreasToContract = async (values) => {
    try {
      const response = await Axios.post(
        "/contract/add-area-to-contract",
        {
          code, // Mã hợp đồng lấy từ URL
          listArea: values.areas, // Danh sách mã khu vực
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
  
      if (response.data.code === 200) {
        Notification(response.data.message, "SUCCESS"); // Thông báo thành công
        onCloseForm();
        refresh();
      } else if (response.data.code === 401) {
        // Xử lý trường hợp token hết hạn tại đây
        const refreshed = await refreshToken();
        if (!refreshed) {
          console.error("Không thể làm mới token. Điều hướng tới trang đăng nhập.");
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
        } else {
          const newAuthToken = localStorage.getItem("authToken"); // Lấy token mới
          // Gọi lại API với token mới
          const retryResponse = await Axios.post(
            "/contract/add-area-to-contract",
            {
              code,
              listArea: values.areas,
            },
            { headers: { Authorization: `Bearer ${newAuthToken}` } }
          );
          if (retryResponse.data.code === 200) {
            Notification(retryResponse.data.message, "SUCCESS"); // Thông báo thành công
            onCloseForm();
            refresh();
          } else {
            Notification(retryResponse.data.message, "ERROR");
          }
        }
      } else {
        Notification(response.data.message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message = error.response?.data?.message || "Đã xảy ra lỗi khi thêm khu vực!";
      Notification(message, "ERROR");
      throw error;
    }
  };
  
  const validationSchema = yup.object().shape({
    areas: yup.array().min(1, "Chọn ít nhất một khu vực").required("Bắt buộc"),
  });

  const initialValues = { areas: [] };

  return (
    <Box m="20px">
      <Header title="Thêm khu vực vào hợp đồng" subtitle="Chọn khu vực để thêm" />

      {/* Hiển thị mã hợp đồng */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Mã hợp đồng"
          value={code}
          InputProps={{ readOnly: true }}
          disabled
          variant="outlined"
        />
      </Box>

      <Formik
        onSubmit={addAreasToContract}
        initialValues={initialValues}
        validationSchema={validationSchema}
        innerRef={formikRef} // Gán formikRef vào Formik

      >
        {({
          values,
          errors,
          touched,
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
              <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
                <InputLabel>Khu vực chưa có hợp đồng</InputLabel>
                <Select
                  multiple
                  value={values.areas}
                  onChange={(event) =>
                    setFieldValue("areas", event.target.value)
                  }
                  input={<OutlinedInput label="Khu vực chưa có hợp đồng" />}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (areaCode) =>
                          areaOptions.find((area) => area.code === areaCode)
                            ?.name
                      )
                      .join(", ")
                  }
                >
                  {areaOptions.map((area) => (
                    <MenuItem key={area.code} value={area.code}>
                      <Checkbox checked={values.areas.includes(area.code)} />
                      <ListItemText primary={area.name} />
                    </MenuItem>
                  ))}
                </Select>
                {touched.areas && errors.areas && (
                  <Box sx={{ color: "red" }}>{errors.areas}</Box>
                )}
              </FormControl>
            </Box>

            {/* <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Thêm khu vực
              </Button>
            </Box> */}
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
