import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import { useState, useEffect } from "react";
import {
  Select, MenuItem, FormControl, InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";


const Form = ({ rowData, industrialParkCode, refresh, onCloseForm,formikRef }) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const token = localStorage.getItem("authToken") || "";
  const [userList, setUserList] = useState([]);


  const AddArea = async (values) => {
    const apiEndpoint = '/area/create';
    const postData = {
      industrialParkCode,
      ...values
    };
    console.log(postData);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, postData, { headers })
      .then(response => {
        console.log(response.data);
        if (response.data.code !== 200) {
          Notification(response.data.message, "WARNING");
          return;
        }
        Notification(response.data.message, "SUCCESS");
        onCloseForm();
      })
      .catch(error => {
        // message = response.message;
        console.error('Error:', error.response ? error.response.data : error);
        Notification(error.response.data.message, "WARNING");
      });
  }

  const UpdateArea = async (values, oldCode) => {
    const apiEndpoint = '/area/update';
    const postData = {
      industrialParkCode: industrialParkCode,
      code: oldCode,
      newCode: values.code || null,
      name: values.name,
      description: values.description,
      square: values.square,
      userCode: values.userCode
    };
    console.log(postData);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, postData, { headers })
      .then(response => {
        console.log(response.data);
        if (response.data.code !== 200) {
          Notification(response.data.message, "WARNING");
          return;
        }
        Notification(response.data.message, "SUCCESS");
        onCloseForm();
      })
      .catch(error => {
        // message = response.message;
        console.error('Error:', error.response ? error.response.data : error);
        Notification(error.response.data.message, "WARNING");
      });
  }
  const fetchDataUser = async () => {
    const apiEndpoint = '/sys-user/search';
    const postData = {
      pageIndex: 1,
      pageSize: 10000
    };
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, postData, { headers })
      .then(response => {

        console.log(response.data);
        const responseData = response.data;
        setUserList(responseData.data.content);
      })
      .catch(error => {

      });
  }
  useEffect(() => {
    fetchDataUser();
  }, [])

  const handleFormSubmit = async (values) => {
    //update function
    if (rowData) {
      await UpdateArea(values, rowData.code);
      // console.log(values);
    } else { //add functions
      await AddArea(values);
    }
    refresh();
  };

  return (
    <Box m="20px">
      <Header
        title={rowData ? "Chỉnh sửa vùng đất" : "Thêm vùng đất"}
        subtitle={
          rowData
            ? "Chỉnh sửa chi tiết vùng đất"
            : "Thêm một vùng đất"
        }
      />

      <Formik
        innerRef={formikRef}
        onSubmit={handleFormSubmit}
        initialValues={rowData || initialValues} // Nếu có rowData, form sẽ tự động điền
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
                disabled
                fullWidth
                variant="filled"
                type="text"
                label="Mã khu công nghiệp"
                onBlur={handleBlur}
                onChange={handleChange}
                value={industrialParkCode}
                name="industrialParkCode"
                sx={{ gridColumn: "span 4" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                      Mã<span style={{ color: 'red' }}>(*)</span>
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
                label={
                  <span>
                      Tên<span style={{ color: 'red' }}>(*)</span>
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
                type="number"
                label={
                  <span>
                      Diện tích(hec-ta)<span style={{ color: 'red' }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.square}
                name="square"
                error={!!touched.square && !!errors.square}
                helperText={touched.square && errors.square}
                sx={{ gridColumn: "span 4" }}
              />

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Thêm người quản lý</InputLabel>
                <Select
                  label="Thêm người quản lý"
                  name="userCode"
                  value={values.userCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.userCode && !!errors.userCode}
                  renderValue={(selected) => {
                    const selectedUser = userList.find((user) => user.code === selected);
                    return selectedUser ? `${selectedUser.userName} - ${selectedUser.phone}` : "Chọn người quản lý";
                  }}
                >
                  {/* Header Row */}
                  <MenuItem disabled>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Phone</strong></TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer>
                  </MenuItem>

                  {/* User Data Rows */}
                  {userList.length !== 0 ? (
                    userList.map((user) => (
                      <MenuItem key={user.code} value={user.code}>
                        <TableContainer component={Paper} elevation={0}>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      Không có người quản lý
                    </MenuItem>
                  )}
                </Select>
                {touched.userCode && errors.userCode && (
                  <p style={{ color: "red", fontSize: "0.75rem" }}>{errors.userCode}</p>
                )}
              </FormControl>

            </Box>
            {/* <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {rowData ? "Cập nhập vùng đất" : "Thêm vùng đất"}
              </Button>
            </Box> */}
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Phải nhập trường này").max(255, "Tên không được vượt quá 255 ký tự"),
  code: yup.string().required("Phải nhập trường này").max(255, "Mã không được vượt quá 255 ký tự"),
  square: yup.number().required("Phải nhập trường này").min(0.01,"Phải lớn hơn 0"),

});

const initialValues = {
  name: "",
  code: "",
  description: "",
  status: "",
  userCode: ""

};

export default Form;
