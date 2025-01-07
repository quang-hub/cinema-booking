import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Form from "../form/AddContractForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertDialog from "../../components/AlertDialog"; // Import AlertDialog
import Notification from "../../components/Notification";
import dayjs from "dayjs";
import { refreshToken } from "../../components/RefreshToken";
import Axios from "../../components/Axios";
import { hasPermission } from "../login/DecodeToken";
import { TextField } from "@mui/material";
import Loader from "../../components/Loading";

const ManageContract = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false); // State cho dialog Import
  const [selectedContract, setSelectedContract] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
  const [selectedContractCode, setSelectedContractCode] = useState([]);
  const [openAlert, setOpenAlert] = useState(false); // State cho AlertDialog
  const [alertMessage, setAlertMessage] = useState(""); // Message cho AlertDialog
  const [nameSearch, setNameSearch] = useState(null); // Tìm kiếm theo tên
  const [codeSearch, setCodeSearch] = useState(null); // Tìm kiếm theo mã
  const [industrialParkCodeSearch, setIndustrialParkCodeSearch] = useState(null); // Tìm kiếm theo mã kcn
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0
  const [size, setPageSize] = useState(10); // Số hàng trên mỗi trang
  const [totalRows, setTotalRows] = useState(0); // Tổng số hàng
  const [isLoading, setIsLoading] = useState(false);
  const [expiredSearch, setExpiredSearch] = useState(null);
  const handleClickOpenForm = (contract = null) => {
    setSelectedContract(contract); // Lưu dữ liệu hàng được chọn (nếu có) vào state
    setOpenFormDialog(true);
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true); // Mở dialog import
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedContract(null); // Reset lại sau khi đóng form
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false); // Đóng dialog import
  };

  const authToken = localStorage.getItem("authToken");

  const fetchContractData = useCallback(
    async (page, size) => {
      let token = authToken;

      if (!token) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const body = {
          page: page + 1,
          size: size,
          code: codeSearch,
          name: nameSearch,
          industrialParkCode: industrialParkCodeSearch,
          isExpired: expiredSearch
        };

        let response = await Axios.post("/contract/search", body, { headers });

        if (response.status === 200) {
          // Nếu mã trạng thái là 200, gán dữ liệu vào state
          const data = response.data;
          setRows(data.data.data || []);
          setTotalRows(data.data.totalElements || 0);
          return;
        } else if (response.status === 401) {
          const refreshed = await refreshToken(); // Làm mới token

          if (refreshed) {
            // Nếu làm mới thành công, gọi lại API với token mới
            token = localStorage.getItem("authToken");
            headers.Authorization = `Bearer ${token}`; // Cập nhật header

            response = await Axios.post("/contract/search", body, { headers });

            // Kiểm tra mã trạng thái sau khi làm mới token và gọi lại API
            if (response.status === 200) {
              const data = response.data;
              setRows(data.data.data || []);
              setTotalRows(data.data.totalElements || 0);
              return;
            }
          } else {
            console.log("Refresh token không hợp lệ. Chuyển đến login.");
            localStorage.removeItem("authToken");
            window.location.href = "/login";
            return;
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hợp đồng:", error);
        setRows([]);
        setTotalRows(0);
      }
    },
    [authToken, codeSearch, nameSearch, industrialParkCodeSearch,expiredSearch]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchContractData(page, size, codeSearch, nameSearch, industrialParkCodeSearch,expiredSearch);
      setIsLoading(false);
    };

    fetchData();
  }, [page, size,codeSearch, nameSearch, industrialParkCodeSearch,expiredSearch]);

  const handleEditContract = async (contractCode) => {
    const params = {
      code: contractCode,
    };

    const response = await fetchContractByCode(params); // Gọi hàm để lấy thông tin hợp đồng bằng code
    console.log(response);
    if (response && response.data) {
      const contract = response.data; // Lấy hợp đồng

      // Cập nhật thông tin
      setSelectedContract({
        code: contract.code,
        name: contract.name,
        description: contract.description,
        industrialParkCode: contract.industrialParkCode,
        endDate: dayjs(contract.endDate).format("YYYY-MM-DDTHH:mm:ss"), // Định dạng ngày giờ yêu cầu
        startDate: dayjs(contract.startDate).format("YYYY-MM-DDTHH:mm:ss"),
        contractDetail: {
          lessor: contract.lessor,
          representativeLessor: contract.representativeLessor,
          lessorPhone: contract.lessorPhone,
          lessee: contract.lessee,
          representativeLessee: contract.representativeLessee,
          lesseePhone: contract.lesseePhone,
        },
      });

      setOpenFormDialog(true); // Mở dialog chỉnh sửa
    } else {
      console.error(
        "Contract data is not in the expected format or not found."
      );
    }
  };

  const fetchContractByCode = async (params) => {
    const { code } = params;
    let token = localStorage.getItem("authToken");

    if (!token) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return null;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Gắn token vào header
      };

      let response = await Axios.get(`/contract/get-detail/${code}`, {
        headers,
      });

      // Nếu token hết hạn (401), thử làm mới token
      if (response.status === 401) {
        console.log("Access token hết hạn. Đang làm mới...");

        const refreshed = await refreshToken(); // Làm mới token

        if (refreshed) {
          // Gọi lại API với token mới nếu làm mới thành công
          token = localStorage.getItem("authToken");
          headers.Authorization = `Bearer ${token}`; // Cập nhật header

          response = await Axios.get(`/contract/get-detail/${code}`, {
            headers,
          });
        } else {
          console.log("Refresh token không hợp lệ. Chuyển đến login.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return null;
        }
      }

      // Kiểm tra phản hồi
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data; // Trả về dữ liệu hợp đồng
    } catch (error) {
      console.error("Error fetching contract by code:", error);
      return null; // Trả về null nếu gặp lỗi
    }
  };

  // Hàm xóa hợp đồng theo mã
  const handleDeleteContract = (contractCode) => {
    if (!contractCode) {
      setAlertMessage("Vui lòng chọn hợp đồng để xóa.");
      setOpenAlert(true);
      return;
    }

    setSelectedContractCode(contractCode); // Lưu lại mã hợp đồng cần xóa
    setAlertMessage("Bạn có chắc chắn muốn xóa hợp đồng này không?");
    setOpenAlert(true); // Hiển thị AlertDialog
  };

  const handleAlertDialogClose = async (confirmed) => {
    setOpenAlert(false);

    if (!confirmed) return;
    setIsLoading(true);
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let response = await Axios.post(
        `/contract/delete/${selectedContractCode}`,
        {},
        { headers }
      );

      // Nếu token hết hạn, làm mới token và thử lại
      if (response.status === 401) {
        console.log("Access token hết hạn. Đang làm mới...");

        const refreshed = await refreshToken();

        if (refreshed) {
          token = localStorage.getItem("authToken"); // Lấy token mới
          headers.Authorization = `Bearer ${token}`; // Cập nhật token

          response = await Axios.post(
            `/contract/delete/${selectedContractCode}`,
            {},
            { headers }
          );
        } else {
          console.log("Refresh token không hợp lệ. Chuyển đến login.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return;
        }
      }

      const result = response.data;

      if (response.status === 200 && result.code === 200) {
        Notification(result.message, "SUCCESS"); // Thông báo thành công
        fetchContractData(page, size); // Fetch lại dữ liệu
      } else {
        Notification(
          result.message || "Đã xảy ra lỗi khi xóa hợp đồng.",
          "ERROR"
        );
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      Notification(
        "Có lỗi xảy ra khi xóa hợp đồng. Vui lòng thử lại sau.",
        "ERROR"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    await ExportData();
  };

  const ExportData = async () => {
    try {
      const requestData = {
        page: 1,
        size: 10000,
      };
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(`/contract/export`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Đảm bảo nhận dữ liệu dưới dạng blob
      });

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Du_lieu_Hop_dong.xlsx"); // Tên tệp tải về
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Thông báo thành công
      Notification("Tải xuống thành công", "SUCCESS");
    } catch (error) {
      console.error("Error exporting data:", error);
      Notification(error.responseData?.message || "Có lỗi xảy ra", "WARNING");
    }
  };

  const formikRef = useRef();

  const columns = [
    {
      field: "actions",
      headerName: "Hành động",
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          <IconButton
            color="secondary"
            onClick={() => handleEditContract(params.row.code)}
            disabled={
              !hasPermission("UPDATE_CONTRACT") ||
              !hasPermission("MANAGE_INDUSTRIAL_PARK")
            }
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="warning"
            onClick={() => handleDeleteContract(params.row.code)}
            disabled={
              !hasPermission("DELETE_CONTRACT") ||
              !hasPermission("MANAGE_INDUSTRIAL_PARK")
            }
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      width: 80, // Đặt chiều rộng cụ thể
      sortable: false,
      filterable: false,
      align: "center",
    },

    {
      field: "code",
      headerName: "Mã hợp đồng",
      type: "string",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Link
          to={`/manage-contract/${params.row.code}/${params.row.industrialParkCode}`} // Đảm bảo URL chính xác
          className="text-blue-500 cursor-pointer underline"
        >
          {params.value}
        </Link>
      ),
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setCodeSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "industrialParkCode",
      headerName: "Mã KCN",
      headerAlign: "center",
      flex: 1,
      cellClassName: "name-column--cell",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setIndustrialParkCodeSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "name",
      headerName: "Tên hợp đồng",
      flex: 1,
      cellClassName: "name-column--cell",
      headerAlign: "center",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "startDate",
      headerName: "Ngày bắt đầu",
      headerAlign: "center",
      flex: 1,
      cellClassName: "name-column--cell",
      valueGetter: (params) =>
        new Date(params.value).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    {
      field: "endDate",
      headerName: "Ngày kết thúc",
      headerAlign: "center",
      flex: 1,
      cellClassName: "name-column--cell",
      valueGetter: (params) =>
        new Date(params.value).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    {
      field: "expired",
      headerName: "Trạng thái",
      headerAlign: "center",
      flex: 1,
      width: 200,
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Hiển thị tiêu đề cột */}
          <Box>{params.colDef.headerName}</Box>
          {/* Dropdown Select */}
          <FormControl size="small" fullWidth sx={{ width: "100%" }}>
            <Select
              value={expiredSearch} // Liên kết với state
              onChange={(e) => setExpiredSearch(e.target.value)} // Cập nhật state khi chọn giá trị
              displayEmpty // Hiển thị giá trị mặc định
            >
              <MenuItem value={null}>Tất cả</MenuItem>
              <MenuItem value={false}>Còn hạn</MenuItem>
              <MenuItem value={true}>Hết hạn</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ),
      sortable: false,
      renderCell: (params) => {
        let stateLabel = "";
        let stateColor = "";
    
        switch (params.value) {
          case false:
            stateLabel = "Còn hạn";
            stateColor = "green";
            break;
          case true:
            stateLabel = "Hết hạn";
            stateColor = "red";
            break;
          default:
            stateLabel = "Không xác định";
            stateColor = "gray";
        }
    
        return (
          <Box
            sx={{
              color: stateColor,
              fontWeight: "bold",
            }}
          >
            {stateLabel}
          </Box>
        );
      },
    }
    
  ];

  return (
    <>
      <AlertDialog
        open={openAlert}
        message={alertMessage}
        onClose={handleAlertDialogClose}
      />

      <Box m="20px">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="20px"
        >
          <Header title="Hợp đồng" subtitle="Quản lý hợp đồng" />
          <Box display="flex" gap="10px">
            {" "}
            {/* Thêm Box với gap để điều chỉnh khoảng cách */}
            {(hasPermission("CREATE_CONTRACT") ||
              hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleClickOpenForm(null)} // Mở form để tạo mới khi không có hàng được chọn
              >
                Thêm
              </Button>
            )}
            {/* <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              // disabled={selectedPermissionId.length === 0} // Vô hiệu hóa nếu không có người dùng nào được chọn
            >
              Xoá
            </Button> */}
            {/* <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleClickOpenImport} // Mở dialog Import
            >
              Nhập file
            </Button> */}
            {(hasPermission("EXPORT_CONTRACT") ||
              hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                sx={{ backgroundColor: colors.blueAccent[700] }}
              >
                Xuất file
              </Button>
            )}
          </Box>
          {/* <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
          onClick={() => handleClickOpenForm(null)} // Mở form để tạo mới khi không có hàng được chọn
        >
          Add
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
          onClick={handleClickOpenImport} // Mở dialog Import
        >
          Import
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
        >
          Export
        </Button> */}
        </Box>
        <Box
          height="73vh"
          sx={{
            overflow: "auto",
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          {hasPermission("VIEW_CONTRACT") ||
          hasPermission("MANAGE_INDUSTRIAL_PARK") ? (
            <DataGrid
              loading={isLoading}
              rows={rows}
              columns={columns}
              pagination
              componentsProps={{
                pagination: {
                  labelRowsPerPage: "Số hàng",
                },
              }}
              page={page}
              pageSize={size}
              getRowId={(row) => row.code} // Sử dụng 'code' làm id
              rowCount={totalRows}
              localeText={{
                MuiTablePagination: {
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`,
                },
              }}
              paginationMode="server"
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[10, 15, 20]}
              headerHeight={60}
              //   onSelectionModelChange={(newSelection) => {
              //     setSelectedPermissionId(newSelection); // Cập nhật danh sách ID được chọn
              //   }}
            />
          ) : (
            <p>Bạn không có quyền xem thông tin hợp đồng.</p>
          )}
        </Box>

        {/* Dialog cho Form Create/Edit */}
        <Dialog
          open={openFormDialog}
          onClose={handleCloseFormDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedContract ? "Sửa Hợp Đồng" : "Tạo Hợp Đồng"}
          </DialogTitle>
          <DialogContent>
            <Form
              selectedContract={selectedContract}
              refresh={() => fetchContractData(page, size)}
              onCloseForm={handleCloseFormDialog}
              formikRef={formikRef} // Truyền ref vào Form component
            />{" "}
            {/* Truyền dữ liệu hàng đã chọn vào form */}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseFormDialog}
              color="primary"
              sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Huỷ
            </Button>

            <Button
              onClick={() => formikRef.current.submitForm()} // Submit form từ Dialog
              color="secondary"
              variant="contained"
            >
              {selectedContract ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog cho Import Excel */}
      </Box>
    </>
  );
};

export default ManageContract;
