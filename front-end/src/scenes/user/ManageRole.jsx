import React, { useCallback, useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  Link,
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Axios from "../../components/Axios"; // Thêm Axios để gọi API
import Header from "../../components/Header";
import Form from "../form/AddRoleForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertDialog from "../../components/AlertDialog"; // Import AlertDialog
import Notification from "../../components/Notification";
import TablePermission from "../form/AddPermisListToRoleForm";
import { refreshToken } from "../../components/RefreshToken";
import ImportExcelDialog from "../files/ImportExcelDialog";
import { hasPermission } from "../login/DecodeToken";
import { TextField } from "@mui/material";
import Loader from "../../components/Loading";

const ManageRole = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState(null);
  const [selectedRolePermission, setSelectedRolePermission] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState([]);
  const [selectedOneRoleId, setSelectedOneRoleId] = useState([]);
  const [openAlert, setOpenAlert] = useState(false); // State cho AlertDialog
  const [alertMessage, setAlertMessage] = useState(""); // Message cho AlertDialog
  const [nameSearch, setNameSearch] = useState(null); // Tìm kiếm theo tên
  const [codeSearch, setCodeSearch] = useState(null); // Tìm kiếm theo mã
  const [permissionIds, setPermissionIds] = useState([]);
  const handlePermissionIdsChange = (allPermissionIds) => {
    setPermissionIds(allPermissionIds);
  };

  // State cho dữ liệu phân trang
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0
  const [pageSize, setPageSize] = useState(10); // Số hàng trên mỗi trang
  const [totalRows, setTotalRows] = useState(0); // Tổng số hàng

  const [openTablePermissionDialog, setOpenTablePermissionDialog] =
    useState(false);
  const [selectedRoleCode, setSelectedRoleCode] = useState(null);

  // const handleOpenTablePermission = (roleCode) => {
  //   setSelectedRoleCode(roleCode);
  //   setOpenTablePermissionDialog(true);
  // };

  const handleCloseTablePermissionDialog = () => {
    setOpenTablePermissionDialog(false);
    setSelectedRoleCode(null);
  };
  const formikRef = useRef();

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Gọi hàm lưu quyền
      await savePermissions(selectedRoleId, permissionIds);
      console.log(permissionIds);
      console.log("Lưu các quyền đã chọn thành công");
    } catch (error) {
      console.error("Lỗi khi lưu quyền:", error);
    }finally{
      setIsLoading(false)
    }

    handleCloseTablePermissionDialog(); // Đóng dialog sau khi lưu
  };
  const authToken = localStorage.getItem("authToken");

  const fetchAllRoles = useCallback(
    async (page, pageSize) => {
      try {
        if (!authToken) {
          window.location.href = "/login";
          return { data: [], total: 0 };
        }

        const response = await Axios.post(
          "/sys-role/search",
          {
            pageSize,
            pageIndex: page + 1,
            name: nameSearch, // Thêm tìm kiếm theo tên
            code: codeSearch, // Thêm tìm kiếm theo mã
          },
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        // Kiểm tra mã code trả về từ API
        if (response.data.code === 200) {
          return {
            data: response.data.data.content || [],
            total: response.data.data.totalElements || 0,
          };
        } else if (response.data.code === 401) {
          // Token hết hạn, gọi hàm làm mới token
          const refreshed = await refreshToken();

          if (refreshed) {
            // Nếu làm mới thành công, lấy token mới từ localStorage
            const newToken = localStorage.getItem("authToken");

            // Thực hiện lại yêu cầu với token mới
            const retryResponse = await Axios.post(
              "/sys-role/search",
              {
                pageSize,
                pageIndex: page + 1,
                name: nameSearch, // Thêm tìm kiếm theo tên
                code: codeSearch, // Thêm tìm kiếm theo mã
              },
              {
                headers: { Authorization: `Bearer ${newToken}` },
              }
            );

            return {
              data: retryResponse.data.data.content || [],
              total: retryResponse.data.data.totalElements || 0,
            };
          } else {
            // Không thể làm mới token, điều hướng đến trang đăng nhập
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          }
        } else {
          console.error("Unexpected response code:", response.data.code);
          return { data: [], total: 0 };
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        return { data: [], total: 0 };
      }
    },
    [authToken, nameSearch, codeSearch]
  );

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, total } = await fetchAllRoles(page, pageSize, nameSearch, codeSearch);
      setRows(data);
      setTotalRows(total);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  }, [fetchAllRoles, page, pageSize, nameSearch, codeSearch]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleClickOpenForm = (role = null) => {
    setSelectedRoles(role);
    setOpenFormDialog(true);
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedRoles(null);
    loadRoles();
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
  };

  const fetchRoleById = async (id) => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Thực hiện yêu cầu lấy thông tin vai trò
      let response = await Axios.get(`/sys-role/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Kiểm tra lỗi 401
      if (response.status === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token

        if (refreshed) {
          // Nếu làm mới thành công, lấy token mới từ localStorage
          const newToken = localStorage.getItem("authToken");

          // Thực hiện lại yêu cầu với token mới
          response = await Axios.get(`/sys-role/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          localStorage.removeItem("authToken");
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập nếu không thể làm mới token
          return;
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching role data:", error);
      return null;
    }
  };

  const handleEditRole = async (id) => {
    const role = await fetchRoleById(id);

    if (role && role.data) {
      // Cập nhật thông tin
      setSelectedRoles({
        id: role.data.id,
        code: role.data.code,
        name: role.data.name,
        note: role.data.note,
      });

      setOpenFormDialog(true);
    } else {
      console.error("User data is not in the expected format or not found.");
    }
  };

  const savePermissions = async (roleId) => {
    const authToken = localStorage.getItem("authToken");

    try {
      console.log(`Calling API with ID: ${roleId}`);

      let response = await Axios.post(
        `/sys-role/${roleId}/create-update`,
        permissionIds, // Gửi ID quyền dưới dạng mảng
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Kiểm tra lỗi 401 (token hết hạn)
      if (response.status === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token
        if (refreshed) {
          const newToken = localStorage.getItem("authToken");

          // Thực hiện lại yêu cầu với token mới
          response = await Axios.post(
            `/sys-role/${roleId}/create-update`,
            permissionIds,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            }
          );
        } else {
          console.error(
            "Không thể làm mới token. Điều hướng tới trang đăng nhập."
          );
          window.location.href = "/login"; // Điều hướng tới trang đăng nhập
          return;
        }
      }

      const result = response.data;

      // Kiểm tra mã code trả về từ API
      if (result.code === 200) {
        Notification(result.message, "SUCCESS"); // Thông báo thành công
        console.log("Permissions Data:", result.data); // Hiển thị dữ liệu trong console
        return result.data; // Trả về dữ liệu nếu cần
      } else {
        Notification(result.message, "ERROR"); // Thông báo lỗi
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Lỗi không xác định";
      Notification(message, "ERROR"); // Thông báo lỗi
      throw error;
    }
  };

  const handleViewRolePermission = async (id) => {
    try {
      const role = await fetchRoleById(id); // Gọi API lấy role theo ID

      if (role && role.data) {
        // Cập nhật thông tin role và danh sách permissions
        setSelectedRolePermission({
          id: role.data.id,
          code: role.data.code,
          name: role.data.name,
          listPermission: role.data.listPermission || [], // Lưu danh sách permissions
        });
        setSelectedRoleId([id]);
        setSelectedRoleCode(role.data.code);
        setOpenTablePermissionDialog(true); // Mở form dialog
      } else {
        console.error("Dữ liệu không hợp lệ hoặc không tìm thấy.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin role:", error);
    }
  };

  // Hàm xóa role theo id
  const handleDeleteRole = (ids) => {
    if (ids.length === 0) {
      setAlertMessage("Vui lòng chọn ít nhất một chức vụ để xóa.");
      setOpenAlert(true);
      return;
    }

    setSelectedRoleId(ids); // Lưu lại danh sách ID cần xoá
    setAlertMessage("Bạn có chắc chắn muốn xoá những chức vụ đã chọn không?");
    setOpenAlert(true); // Hiển thị AlertDialog
  };

  const handleDeleteOneRole = (id) => {
    setSelectedOneRoleId([id]); // Lưu lại danh sách ID cần xoá
    setAlertMessage("Bạn có chắc chắn muốn xoá chức vụ đã chọn không?");
    setOpenAlert(true);
  };

  const handleAlertDialogClose = async (confirmed) => {
    setOpenAlert(false);

    if (confirmed) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("authToken");
        console.log(selectedOneRoleId, selectedRoleId);

        const response = await Axios.post(
          "/sys-role/delete",
          selectedRoleId.length === 0 ? selectedOneRoleId : selectedRoleId, // Gửi ID vai trò được chọn
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = response.data;

        // Kiểm tra mã phản hồi từ API
        if (result.code === 200) {
          const message = result.message;
          Notification(message, "SUCCESS"); // Thông báo thành công
          loadRoles(); // Fetch lại dữ liệu sau khi xóa
        } else {
          const message = result.message;
          Notification(message, "ERROR"); // Thông báo lỗi
        }
      } catch (error) {
        const message = error.message || "Có lỗi xảy ra"; // Thông báo lỗi chung
        console.error("Error deleting role:", error);
        Notification(message, "ERROR"); // Thông báo lỗi
      }finally {
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
        roleName: nameSearch, // Thêm tìm kiếm theo tên
        roleCode: codeSearch, // Thêm tìm kiếm theo mã
      };
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(
        `/role-permisison/export`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Đảm bảo nhận dữ liệu dưới dạng blob
        }
      );

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Du_lieu_chuc_vu.xlsx"); // Tên tệp tải về
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
            onClick={() => handleEditRole(params.id)}
            color="secondary"
            disabled={!hasPermission("UPDATE_ROLE")}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteOneRole(params.id)}
            color="warning"
            disabled={!hasPermission("DELETE_ROLE")}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      flex: 0.5,
      sortable: false,
      filterable: false,
    },
    {
      field: "code",
      headerName: "Mã chức vụ",
      headerAlign: "center",
      flex: 0.5,
      renderCell: (params) => (
        <Link
          onClick={
            hasPermission("UPDATE_ROLE")
              ? () => handleViewRolePermission(params.id)
              : null
          }
          sx={{
            textTransform: "none",
            color: colors.greenAccent[300],
            padding: "0 16px", // Thêm padding trái và phải
            display: "inline-block",
            borderRadius: "4px",
            "&:hover": {
              cursor: hasPermission("UPDATE_ROLE") ? "pointer" : "not-allowed", // Đổi thành not-allowed nếu không có quyền
              textDecoration: hasPermission("UPDATE_ROLE")
                ? "underline"
                : "none", // Không gạch chân nếu không có quyền
            },
          }}
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
      field: "name",
      headerName: "Tên chức vụ",
      flex: 0.5,
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
      field: "note",
      headerName: "Ghi chú",
      flex: 1,
      headerAlign: "center",
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
          <Header title="Chức vụ" subtitle="Quản lý chức vụ" />
          <Box display="flex" gap="10px">
            {hasPermission("CREATE_ROLE") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleClickOpenForm(null)}
              >
                Thêm chức vụ
              </Button>
            )}

            {hasPermission("DELETE_ROLE") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleDeleteRole(selectedRoleId)} // Xóa nhiều người dùng
                disabled={selectedRoleId.length === 0} // Vô hiệu hóa nếu không có người dùng nào được chọn
              >
                Xoá chức vụ
              </Button>
            )}

            {hasPermission("IMPORT_ROLE_PERMISSION") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={handleClickOpenImport}
              >
                Nhập file
              </Button>
            )}
            {hasPermission("EXPORT_ROLE_PERMISSION") && (
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
          {hasPermission("VIEW_ROLE") ? (
            
              <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                pagination
                componentsProps={{
                  pagination: {
                    labelRowsPerPage: "Số hàng",
                  },
                }}
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
                  setSelectedRoleId(newSelection); // Cập nhật danh sách ID được chọn
                }}
                headerHeight={60}
              />
            )
          : (
            <p>Bạn không có quyền xem thông tin chức vụ</p>
          )}

          {/* Dialog cho TablePermission */}
          <Dialog
            open={openTablePermissionDialog}
            onClose={handleCloseTablePermissionDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{`Quyền cho ${selectedRoleCode}`}</DialogTitle>
            <DialogContent>
              <TablePermission
                selectedRolePermission={selectedRolePermission}
                onPermissionIdsChange={handlePermissionIdsChange}
                onClose={handleCloseTablePermissionDialog}
              />
            </DialogContent>

            <DialogActions>
              <LoadingButton onClick={handleSave} variant="contained" color="primary" loading={isLoading}>
                Lưu
              </LoadingButton>
              <Button
                onClick={handleCloseTablePermissionDialog}
                color="primary"
                sx={{
                  color: theme.palette.mode === "dark" ? "white" : "black",
                }}
              >
                Huỷ
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* Dialog cho Form Create/Edit */}
        <Dialog
          open={openFormDialog}
          onClose={handleCloseFormDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedRoles ? "Chỉnh sửa chức vụ" : "Tạo mới chức vụ"}
          </DialogTitle>
          <DialogContent>
            <Form
              selectedRoles={selectedRoles}
              refresh={() => loadRoles()}
              onCloseForm={handleCloseFormDialog}
              formikRef={formikRef} // Truyền ref vào Form component
            />{" "}
            {""}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseFormDialog}
              color="primary"
              sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Huỷ
            </Button>
            <LoadingButton
              onClick={() => formikRef.current.submitForm()} // Submit form từ Dialog
              color="secondary"
              variant="contained"
              loading={isLoading}
            >
              {selectedRoles ? "Cập nhật" : "Tạo mới"}
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Dialog cho Import Excel */}
        <Dialog
          open={openImportDialog}
          onClose={handleCloseImportDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Nhập file dữ liệu chức vụ</DialogTitle>
          <DialogContent>
            <ImportExcelDialog
              type={"role-permisison"}
              name={"chức vụ"}
              refresh={() => fetchAllRoles()}
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

export default ManageRole;
