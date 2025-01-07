import React, { useEffect, useState } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckIcon from "@mui/icons-material/Check";
import { useDropzone } from "react-dropzone";
import Notification from "../../components/Notification";
import Axios from "../../components/Axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Loading from "../../components/Loading";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from '@mui/icons-material/Close';

const ImportExcelDialog = ({
  onClose,
  type,
  name,
  refresh,
  parkId,
}) => {
  let token = localStorage.getItem("authToken") || "";
  const [selectedFile, setSelectedFile] = useState(null); // State for a single selected file
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState();
  const handleCancel = () => {
    if (onClose) onClose(); // Gọi hàm đóng Dialog
  };
  const [isShow, setIsShow] = useState(true);
  // Handle file selection
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]; // Only take the first file
    console.log(file.name);

    if (file) {
      if (
        file.name.endsWith(".xlsx") || // Correct spelling of ".xlsx"
        file.name.endsWith(".xls")
      ) {
        setSelectedFile({ file, status: "Sẵn sàng" });
        setIsShow(true);
      } else {
        Notification("Vui lòng chỉ tải lên file .xlsx hoặc .xls", "ERROR");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Allow only one file
    accept: ".xlsx,.xls", // Specify accepted file types
  });

  const handleUpload = async () => {
    if (selectedFile) {
      await ImportExcelData();
    }
  };
  const handleDeleteFile = () => {
    setSelectedFile(null); // Reset the selected file
    setRows([]); // Optionally reset the rows if needed
  };

  const ImportExcelData = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile.file);
    const apiEndpoint = `/${type}/import${parkId ? `/${parkId}` : ""}`;
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await Axios.post(apiEndpoint, formData, {
        headers,
        responseType: "blob",
      });
      Notification("Thành công", "SUCCESS");
      console.log(response.data); // Check if this is a Blob or valid data

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Kết quả của nhập file ${name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose(); // Close the dialog first
      setTimeout(refresh, 500); // Delay refresh slightly to avoid re-render issues
    } catch (error) {
      Notification(error.response?.data?.message, "ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      if (type === "area") {
        type = `${type}/${parkId}`;
      }
      const response = await Axios.get(`/${type}/download-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Ensure the response is received as a blob
      });

      // Create a blob URL and download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Properly concatenate the filename using template literals
      link.setAttribute("download", `dữ liệu mẫu ${name}.xlsx`);

      document.body.appendChild(link);
      link.click();

      // Remove the link from the DOM after clicking
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      setIsLoading(true);
      fetchUploadFile(selectedFile);
      setIsLoading(false);
    }
  }, [selectedFile]);

  const fetchUploadFile = async (selectedFile) => {
    const formData = new FormData();
    formData.append("file", selectedFile.file);
    if (type === "area") {
      type = `${type}/${parkId}`;
    }
    const apiEndpoint = `/${type}/preview`;
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await Axios.post(apiEndpoint, formData, { headers });
      const responseData = response.data;
      console.log(responseData);

      if (responseData.code !== 200) {
        Notification(responseData.message, "WARNING");
        setIsShow(false);
        return;
      }
      setRows(responseData.data);
      if (responseData.data.length === 0) {
        Notification("Nhầm file hoặc file không có dữ liệu", "WARNING");
        setIsShow(false);
      }
    } catch (error) {
      // Handle error if needed
    }
  };

  const getRowId = (row) => {
    switch (type) {
      case "role-permisison":
        return `${row.roleCode}-${row.permissionCode}`;
      case "sys-permission":
        return row.permissionCode;
      default:
        return row.code || 1; // Fallback to an `id` field if available
    }
  };

  const commonColumns = [
    {
      field: "result",
      headerName: "Kết quả",
      flex: 1, // Cột này sẽ linh động, chiếm không gian còn lại
      minWidth: 250, // Chiều rộng tối thiểu
      renderCell: (params) => {
        return (
          <span
            style={{
              whiteSpace: "normal", // Ngăn dữ liệu xuống dòng
              wordWrap: "break-word",
            }}
          >
            {params.value === null || params.value === undefined ? (
              <CheckCircleIcon className="text-green-400" />
            ) : (
              <span className="text-red-600">{params.value}</span>
            )}
          </span>
        );
      },
    },
  ];

  const getColumnsByType = (type) => {
    switch (type) {
      case "industrial-park":
        return [
          { field: "code", headerName: "Mã", flex: 1 },
          { field: "name", headerName: "Tên", flex: 1 },
          { field: "square", headerName: "Diện tích(ha)", flex: 1 },
          { field: "description", headerName: "Mô tả", flex: 1 },
          ...commonColumns,
        ];
      case "area":
        return [
          { field: "code", headerName: "Mã", flex: 1 },
          { field: "name", headerName: "Tên", flex: 1 },
          {
            field: "industrialParkCode",
            headerName: "Mã khu công nghiệp",
            flex: 1,
          },
          { field: "square", headerName: "Diện tích(ha)", flex: 1 },
          { field: "description", headerName: "Mô tả", flex: 1 },
          ...commonColumns,
        ];
      case "sys-user":
        return [
          { field: "code", headerName: "Mã", flex: 1 },
          { field: "userName", headerName: "Tên tài khoản", flex: 1 },
          { field: "fullName", headerName: "Họ và tên", flex: 1 },
          { field: "email", headerName: "Email", flex: 1 },
          { field: "phone", headerName: "Số điện thoại", flex: 1 },
          { field: "strRole", headerName: "Chức vụ", flex: 1 },
          ...commonColumns,
        ];
      case "sys-permission":
        return [
          { field: "permissionCode", headerName: "Mã quyền", flex: 1 },
          { field: "permissionName", headerName: "Tên quyền", flex: 1 },
          { field: "note", headerName: "Mô tả", flex: 1 },
          ...commonColumns,
        ];
      case "role-permisison":
        return [
          { field: "roleCode", headerName: "Mã chức vụ", flex: 1 },
          { field: "permissionCode", headerName: "Mã quyền", flex: 1 },
          ...commonColumns,
        ];
      default:
        return commonColumns;
    }
  };

  const columns = getColumnsByType(type);

  return (
    <>
      <DialogTitle>Tải tệp lên</DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          className="text-gray-600 flex justify-between"
        >
          <span>Tệp đính kèm (hỗ trợ .xls/.xlsx)</span>
          <button
            onClick={handleDownloadSample}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            Tải mẫu <DownloadIcon className="ml-1" />
          </button>
        </Typography>

        <Box
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center mt-4 ${
            isDragActive ? "bg-blue-50" : "bg-white"
          }`}
        >
          <input {...getInputProps()} />
          <UploadFileIcon className="text-blue-500 text-5xl" />
          <Typography className="text-blue-500 mt-2 font-semibold">
            {isDragActive
              ? "Thả tập tin vào đây..."
              : "Nhấp hoặc kéo tập tin của bạn vào đây"}
          </Typography>
        </Box>

        {selectedFile && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên file</TableCell>
                  <TableCell>Kích thước</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{selectedFile.file.name}</TableCell>
                  <TableCell>
                    {(selectedFile.file.size / 1024).toFixed(2)} KB
                  </TableCell>
                  <TableCell>
                    <CheckCircleIcon className="text-green-600" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteFile()}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {rows.length !== 0 && (
          <>
            {!isLoading && isShow ? (
              <div
                style={{
                  height: 300,
                  width: "100%",
                  marginTop: 20,
                  overflowX: "auto",
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={getRowId}
                  pageSize={5}
                  rowHeight={60}
                />
              </div>
            ) : (
              <Loading />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
          color="primary"
          sx={{
            color: "black",
            backgroundColor: "#E8E8E8",
            padding: 0,
            paddingRight: 1,
            "&:hover": {
              backgroundColor: "#c2c2c2",
              color: "#000000",
            },
          }}
        >
          <IconButton>
            <CloseIcon fontSize="small" />
          </IconButton>
          Hủy
        </Button>
        <Button
          onClick={handleUpload}
          color="primary"
          sx={{
            color: "white",
            backgroundColor: "#31AA54",
            padding: 0,
            paddingRight: 1,
            "&:hover": {
              backgroundColor: "#268240",
              color: "#FFFFFF",
            },
          }}
        >
          <IconButton sx={{ color: "#FFFFFF" }}>
            <CheckIcon fontSize="small" />
          </IconButton>
          Tải lên
        </Button>
      </DialogActions>
    </>
  );
};

export default ImportExcelDialog;
