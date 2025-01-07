import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormLabel,
  Typography,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import CloseIcon from "@mui/icons-material/Close";

const Form = ({ rowData, refresh, onCloseForm, formikRef }) => {
  let token = localStorage.getItem("authToken") || "";
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectFile, setSelectFile] = useState(rowData?.video || null);

  const handleRemoveVideo = () => {
    setPreview("");
    setSelectFile(null);
  };

  const fetchDataAddIndustrialPark = async (values) => {
    setIsLoading(true);
    const formData = new FormData();
    const apiEndpoint = "/industrial-park/create";
    const postData = values;
    delete postData.file;
    console.log(values.fileIntro);

    formData.append(
      "request",
      new Blob([JSON.stringify(postData)], {
        type: "application/json",
      })
    );

    formData.append("file", values.fileIntro);

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, formData, { headers })
      .then((response) => {
        // console.log(response.data);

        // setMessage(response.data.message);
        if (response.data.code !== 200) {
          Notification(response.data.message, "WARNING");
          return;
        }
        Notification(response.data.message, "SUCCESS");
        onCloseForm();
      })
      .catch((error) => {
        // message = response.message;
        // console.error('Error:', error);
        Notification(error.response.data.message, "WARNING");
      });
    setIsLoading(false);
  };
  const convertUrlToFile = async (url, fileName) => {
    try {
      const response = await fetch(url); // Fetch the file
      const blob = await response.blob(); // Get the file content as a Blob
      const fileType = blob.type; // Get the MIME type of the file
      return new File([blob], fileName, { type: fileType }); // Create a new File object
    } catch (error) {
      console.error("Error converting URL to file:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchDataUser();
  }, []);

  useEffect(() => {
    const initializeFile = async () => {
      if (rowData?.video) {
        const file = await convertUrlToFile(rowData.video, "video.mp4");
        setSelectFile(file);
        setPreview(rowData?.video);
      }
    };
    initializeFile();
  }, [rowData?.video]);

  const fetchDataUser = async () => {
    setIsLoading(true);
    const apiEndpoint = "/sys-user/search";
    const postData = {
      pageIndex: 1,
      pageSize: 10000,
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, postData, { headers })
      .then((response) => {
        console.log(response.data);
        const responseData = response.data;
        setUserList(responseData.data.content);
      })
      .catch((error) => {});
    setIsLoading(false);
  };

  const fetchDataUpdateIndustrialPark = async (values) => {
    const apiEndpoint = "/industrial-park/update";
    const formData = new FormData();
    const postData = values;
    delete postData.file;

    formData.append(
      "request",
      new Blob([JSON.stringify(postData)], {
        type: "application/json",
      })
    );

    formData.append("file", selectFile);

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Replace with your authorization header
    };
    await Axios.post(apiEndpoint, formData, { headers })
      .then((response) => {
        // console.log(response.data);

        // setMessage(response.data.message);
        if (response.data.code !== 200) {
          Notification(response.data.message, "WARNING");
          return;
        }
        Notification(response.data.message, "SUCCESS");
        onCloseForm();
      })
      .catch((error) => {
        // message = response.message;
        console.error("Error:", error);
        Notification(error.response?.data?.message, "WARNING");
      });
  };
  //     // Xử lý dữ liệu submit tại đây (ví dụ: gửi lên API)

  // };

  const handleFormSubmit = async (values) => {
    //update function
    if (rowData) {
      await fetchDataUpdateIndustrialPark(values);
    } else {
      //add function
      await fetchDataAddIndustrialPark(values);
    }
    refresh();
    // Xử lý dữ liệu submit tại đây (ví dụ: gửi lên API)
  };

  return (
    <Box m="20px">
      <Header
        title={
          rowData ? "Chỉnh sửa khu công nghiệp" : "Tạo mới khu công nghiệp"
        }
        subtitle={
          rowData ? "Chỉnh sửa khu công nghiệp" : "Tạo mới khu công nghiệp"
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
                label={
                  <span>
                    Mã <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                fullWidth
                variant="filled"
                type="text"
                onBlur={handleBlur}
                onChange={handleChange}
                disabled={rowData ? true : false}
                value={values.code}
                name="code"
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                sx={{ gridColumn: "span 4" }}
                inputProps={{ maxLength: 255 }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Tên khu công nghiệp{" "}
                    <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 4" }}
                inputProps={{ maxLength: 255 }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label={
                  <span>
                    Địa chỉ <span style={{ color: "red" }}>(*)</span>
                  </span>
                }
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{ gridColumn: "span 4" }}
                inputProps={{ maxLength: 255 }}
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
                                inputProps={{
                                    min: 0.01,
                                    max: 100000
                                }}
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
                                        return selectedUser ? `${selectedUser.userName} - ${selectedUser.phone || selectedUser.phone ===undefined ? selectedUser.phone:""}` : "Chọn người quản lý";
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
                    <MenuItem disabled>Không có người quản lý</MenuItem>
                  )}
                </Select>
                {touched.userCode && errors.userCode && (
                  <p style={{ color: "red", fontSize: "0.75rem" }}>
                    {errors.userCode}
                  </p>
                )}
              </FormControl>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }} >
                {/* File Upload Section */}
                <Box sx={{ width: "500px" }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={rowData?.video ? "Thay video" : "Video giới thiệu"}
                    type="file"
                    onBlur={handleBlur}
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      if (file) {
                        const fileUrl = URL.createObjectURL(file); // Generate preview URL
                        setPreview(fileUrl); // Set the preview
                        setSelectFile(file);
                        setFieldValue("fileIntro", file); // Update Formik field value
                      } else {
                        setPreview(null); // Clear preview if no file selected
                      }
                    }}
                    name="fileIntro"
                    error={!!touched.fileIntro && !!errors.fileIntro}
                    helperText={touched.fileIntro && errors.fileIntro}
                    inputProps={{
                      accept: "video/mp4", // Only allow .mp4 files
                    }}
                    InputLabelProps={{
                      shrink: true, // Ensures label sticks to the top
                      sx: { fontSize: "1.25rem" },
                    }}
                  />
                </Box>

                {/* Video Preview Section */}
                {preview && (
                  <Box sx={{ gridColumn: "span 4" }}>
                    <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                      Bản xem trước:
                    </Typography>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "600px", // Limit width for better layout control
                        maxHeight: "1000px",
                        marginBottom: "20px",
                      }}
                    >
                      <video
                        src={preview}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "100%",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      >
                        Trình duyệt của bạn không hỗ trợ phát video.
                      </video>

                      {/* Close Button */}
                      <button
                        onClick={() => {
                          setPreview(null);
                          setSelectFile(null);
                          setFieldValue("fileIntro", null);
                        }}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          padding: "4px",
                          cursor: "pointer",
                        }}
                      >
                        X
                      </button>
                    </Box>
                  </Box>
                )}

                {/* Content Editor Section */}
                <Box sx={{ width: "800px" ,gridColumn: "span 4" }} >
                  <h2>
                    Chỉnh sửa nội dung <span style={{ color: "red" }}>(*)</span>
                  </h2>
                  <ReactQuill
                    value={values.description}
                    onChange={(content) =>
                      setFieldValue("description", content)
                    } // Update Formik field value
                    theme="snow"
                    style={{
                      height: "200px",
                      width: "100%",
                      maxWidth: "800px",
                    }}
                  />
                  <br />
                  {touched.description && errors.description && (
                    <Typography color="error">{errors.description}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  code: yup
    .string()
    .required("Phải nhập trường này")
    .max(255, "Mã không được vượt quá 255 ký tự"),
  name: yup
    .string()
    .required("Phải nhập trường này")
    .max(255, "Tên không được vượt quá 255 ký tự"),
  square: yup
    .number()
    .required("Phải nhập trường này")
    .min(0.01, "Phải lớn hơn 0"),
  description: yup.string().required("Phải nhập trường này"),
  // userCode: yup.string().required("Required"),
  address: yup
    .string()
    .required("Phải nhập trường này")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  fileIntro: yup
    .mixed()
    .nullable() // Cho phép giá trị null hoặc undefined
    .test("fileType", "Chỉ được phép tệp .mp4", (value) => {
      // Nếu không có file thì không cần kiểm tra
      if (!value) return true;
      // Nếu có file, kiểm tra đuôi file
      return value.name && value.name.endsWith(".mp4");
    }),
});

const initialValues = {
  code: "",
  name: "",
  square: "",
  description: "",
  userCode: "",
  address: "",
  fileIntro: null,
};

export default Form;
