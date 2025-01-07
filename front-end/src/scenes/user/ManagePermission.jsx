import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
} from "@mui/material";
import { useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { TextField } from "@mui/material";
import Form from "../form/AddPermissionForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertDialog from "../../components/AlertDialog"; // Import AlertDialog
import Notification from "../../components/Notification";
import { refreshToken } from "../../components/RefreshToken";
import ImportExcelDialog from "../files/ImportExcelDialog";
import Axios from "../../components/Axios";
import { hasPermission } from "../login/DecodeToken";
import Loader from "../../components/Loading";

const ManagePermission = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false); // State cho dialog Import
  const [selectedPermission, setSelectedPermission] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
  const [selectedPermissionId, setSelectedPermissionId] = useState([]);
  const [openAlert, setOpenAlert] = useState(false); // State cho AlertDialog
  const [alertMessage, setAlertMessage] = useState(""); // Message cho AlertDialog
  const [isLoading, setIsLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0
  const [pageSize, setPageSize] = useState(10); // Số hàng trên mỗi trang
  const [totalRows, setTotalRows] = useState(0); // Tổng số hàng
  const [nameSearch, setNameSearch] = useState(null); // Tìm kiếm theo tên
  const [codeSearch, setCodeSearch] = useState(null); // Tìm kiếm theo mã

  const handleClickOpenForm = (permission = null) => {
    setSelectedPermission(permission); // Lưu dữ liệu hàng được chọn (nếu có) vào state
    setOpenFormDialog(true);
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true); // Mở dialog import
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedPermission(null); // Reset lại sau khi đóng form
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false); // Đóng dialog import
  };

  const formikRef = useRef();

  const authToken = localStorage.getItem("authToken");

  const fetchPermissionData = async (
    page,
    pageSize,
    nameSearch,
    codeSearch
  ) => {
    try {
      if (!authToken) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const body = {
        pageSize: pageSize,
        pageIndex: page + 1,
        name: nameSearch, // Thêm tìm kiếm theo tên
        code: codeSearch, // Thêm tìm kiếm theo mã
      };

      let response = await Axios.post("/sys-permission/search", body, {
        headers,
      });

      // Kiểm tra mã trạng thái 401 và thử làm mới token
      if (response.status === 401) {
        const refreshed = await refreshToken();

        if (refreshed) {
          const newAuthToken = localStorage.getItem("authToken");
          headers.Authorization = `Bearer ${newAuthToken}`;
          response = await Axios.post("/sys-permission/search", body, {
            headers,
          });

          if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
            return;
          }
        } else {
          console.error("Could not refresh token. Redirecting to login.");
          window.location.href = "/login";
          return;
        }
      }

      setRows(response.data.data.content || []);
      setTotalRows(response.data.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching permission:", error);
      setRows([]);
      setTotalRows(0);
      // Notification(error.message || "Có lỗi xảy ra khi lấy dữ liệu", "ERROR");
    }
  };

  // Gọi fetchPermissionData khi page hoặc pageSize thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchPermissionData(page, pageSize, nameSearch, codeSearch);
      setIsLoading(false);
    };

    fetchData();
  }, [page, pageSize,nameSearch, codeSearch]);

  const fetchPermissionById = async (id) => {
    try {
      if (!authToken) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      let response = await Axios.get(`/sys-permission/${id}`, { headers });

      // Kiểm tra mã trạng thái 401 và thử làm mới token
      if (response.status === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token

        if (refreshed) {
          // Nếu làm mới thành công, lấy token mới từ localStorage
          const newAuthToken = localStorage.getItem("authToken");

          // Cập nhật lại headers với token mới
          headers.Authorization = `Bearer ${newAuthToken}`;

          // Thực hiện lại yêu cầu với token mới
          response = await Axios.get(`/sys-permission/${id}`, { headers });

          // Kiểm tra lại mã trạng thái
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
            return;
          }
        } else {
          console.error("Could not refresh token. Redirecting to login.");
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập nếu không thể làm mới token
          return;
        }
      }

      // Kiểm tra nếu response không thành công
      if (response.data.code !== 200) {
        throw new Error("Failed to fetch permission data");
      }
      return response.data; // Hoặc thay đổi theo cấu trúc dữ liệu trả về của API
    } catch (error) {
      console.error("Error fetching permission data:", error);
      return null;
    }
  };

  const handleSearchChange = (type, searchterm) => {
    if (type === "name") {
      fetchPermissionData(page, pageSize, searchterm, codeSearch);
      setNameSearch(searchterm);
    }
    if (type === "code") {
      fetchPermissionData(page, pageSize, nameSearch, searchterm);
      setCodeSearch(searchterm);
    }
  };

  const handleEditPermission = async (id) => {
    const permission = await fetchPermissionById(id);
    console.log(permission);
    if (permission && permission.data) {
      // Cập nhật thông tin
      setSelectedPermission({
        id: permission.data.id,
        code: permission.data.code,
        name: permission.data.name,
        note: permission.data.note || "",
      });

      setOpenFormDialog(true);
    } else {
      console.error(
        "Permission data is not in the expected format or not found."
      );
    }
  };

  // Hàm xóa permission theo id
  const handleDeletePermission = (ids) => {
    if (ids.length === 0) {
      setAlertMessage("Vui lòng chọn ít nhất một quyền hạn để xóa.");
      setOpenAlert(true);
      return;
    }

    setSelectedPermissionId(ids); // Lưu lại danh sách ID cần xoá
    setAlertMessage("Bạn có chắc chắn muốn xoá những quyền hạn đã chọn không?");
    setOpenAlert(true); // Hiển thị AlertDialog
  };

  const handleAlertDialogClose = async (confirmed) => {
    setOpenAlert(false);

    if (confirmed) {
      setIsLoading(true); // Bắt đầu trạng thái loading
      try {
        const token = localStorage.getItem("authToken");
        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await Axios.post(
          "/sys-permission/delete",
          selectedPermissionId,
          requestOptions
        );

        // Kiểm tra mã phản hồi từ API
        if (response.data.code === 200) {
          const message = response.data.message;
          Notification(message, "SUCCESS"); // Thông báo thành công
          fetchPermissionData(page, pageSize); // Fetch lại dữ liệu sau khi xóa
        } else if (response.data.code === 401) {
          // Token hết hạn, gọi hàm làm mới token
          const refreshed = await refreshToken();

          if (refreshed) {
            // Nếu làm mới thành công, lấy token mới từ localStorage
            const newToken = localStorage.getItem("authToken");

            // Cập nhật lại headers với token mới
            const newRequestOptions = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            };

            // Thực hiện lại yêu cầu với token mới
            const retryResponse = await Axios.post(
              "/sys-permission/delete",
              selectedPermissionId,
              newRequestOptions
            );

            if (retryResponse.data.code === 200) {
              const message = retryResponse.data.message;
              Notification(message, "SUCCESS"); // Thông báo thành công
              fetchPermissionData(page, pageSize); // Fetch lại dữ liệu sau khi xóa
            } else {
              const message = retryResponse.data.message;
              Notification(message, "ERROR"); // Thông báo lỗi
            }
          } else {
            console.error("Could not refresh token. Redirecting to login.");
            window.location.href = "/login"; // Điều hướng tới trang đăng nhập nếu không thể làm mới token
          }
        } else {
          const message = response.data.message;
          Notification(message, "ERROR"); // Thông báo lỗi
        }
      } catch (error) {
        const message = error.response?.data?.message || "Có lỗi xảy ra";
        console.error("Error deleting permission", error);
        Notification(message, "ERROR"); // Thông báo lỗi
      } finally {
        setIsLoading(false); // Kết thúc trạng thái loading
      }
    }
  };

  const handleExport = async () => {
    await ExportData(nameSearch,codeSearch);
  };

  const ExportData = async () => {
    try {
      const requestData = {
        pageIndex: 1,
        pageSize: 10000,
        name: nameSearch, // Thêm tìm kiếm theo tên
        code: codeSearch, // Thêm tìm kiếm theo mã
      };
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(`/sys-permission/export`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Đảm bảo nhận dữ liệu dưới dạng blob
      });

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Du_lieu_quyen_han.xlsx"); // Tên tệp tải về
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

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      headerAlign: "center",
      width: 90,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Lấy thứ tự của hàng
    },
    {
      field: "actions",
      headerName: "Hành động",
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEditPermission(params.id)}
            color="secondary"
            disabled={!hasPermission("UPDATE_PERMISSION")}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeletePermission(params.id)}
            color="warning"
            disabled={!hasPermission("DELETE_PERMISSION")}
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
      headerName: "Mã quyền",
      type: "string",
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => handleSearchChange("code", e.target.value)}
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
      headerName: "Tên quyền",
      flex: 1,
      cellClassName: "name-column--cell",
      headerAlign: "center",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => handleSearchChange("name", e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "note",
      headerName: "Ghi chú",
      headerAlign: "center",
      flex: 1,
      cellClassName: "name-column--cell",
    },
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
          <Header title="Quyền Hạn" subtitle="Quản lý quyền hạn" />
          <Box display="flex" gap="10px">
            {" "}
            {/* Thêm Box với gap để điều chỉnh khoảng cách */}
            {hasPermission("CREATE_PERMISSION") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleClickOpenForm(null)} // Mở form để tạo mới khi không có hàng được chọn
              >
                Thêm
              </Button>
            )}
            {hasPermission("DELETE_PERMISSION") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleDeletePermission(selectedPermissionId)} // Xóa nhiều người dùng
                disabled={selectedPermissionId.length === 0} // Vô hiệu hóa nếu không có người dùng nào được chọn
              >
                Xoá
              </Button>
            )}
            {hasPermission("IMPORT_PERMISSION") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={handleClickOpenImport} // Mở dialog Import
              >
                Nhập file
              </Button>
            )}
            {hasPermission("EXPORT_PERMISSION") && (
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
          {hasPermission("VIEW_PERMISSION") ? (
            
              <DataGrid
                rows={rows}
                columns={columns}
                pagination
                componentsProps={{
                  pagination: {
                    labelRowsPerPage: "Số hàng",
                  },
                }}

                loading={isLoading}
                page={page}
                pageSize={pageSize}
                rowCount={totalRows}
                paginationMode="server"
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 15, 20]}
                localeText={{
                  MuiTablePagination: {
                    labelDisplayedRows: ({ from, to, count }) =>
                      `${from}–${to} trên ${
                        count !== -1 ? count : `hơn ${to}`
                      }`,
                  },
                }}
                checkboxSelection
                onSelectionModelChange={(newSelection) => {
                  setSelectedPermissionId(newSelection); // Cập nhật danh sách ID được chọn
                }}
                headerHeight={60}
              />
            )
           : (
            <p>Bạn không có quyền xem thông tin quyền hạn.</p>
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
            {selectedPermission ? "Sửa Quyền Hạn" : "Tạo Quyền Hạn"}
          </DialogTitle>
          <DialogContent>
            <Form
              selectedPermission={selectedPermission}
              refresh={() => fetchPermissionData(page, pageSize)}
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
              onClick={() => formikRef.current.submitForm()}
              color="secondary"
              variant="contained"
            >
              {selectedPermission ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog cho Import Excel */}
        <Dialog
          open={openImportDialog}
          onClose={handleCloseImportDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Nhập file dữ liệu quyền hạn</DialogTitle>
          <DialogContent>
            <ImportExcelDialog
              type={"sys-permission"}
              name={"quyền hạn"}
              refresh={() => fetchPermissionData(page, pageSize)}
              onClose={handleCloseImportDialog}
            />
          </DialogContent>
          {/* <DialogActions>
            <Button
              onClick={handleCloseImportDialog}
              color="primary"
              sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Huỷ
            </Button>
          </DialogActions> */}
        </Dialog>
      </Box>
    </>
  );
};

export default ManagePermission;
