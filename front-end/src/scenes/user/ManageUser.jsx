import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
} from "@mui/material";

import { TextField } from "@mui/material";
import { useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Form from "../form/AddUserForm"; // Đảm bảo rằng bạn đã import đúng
// import ImportExcelUserForm from "../form/ImportFileUser";
import AlertDialog from "../../components/AlertDialog"; // Import AlertDialog
import Notification from "../../components/Notification";
import { refreshToken } from "../../components/RefreshToken";
import ImportExcelDialog from "../files/ImportExcelDialog";
import { hasPermission } from "../login/DecodeToken";
import Axios from "../../components/Axios";
import Loader from "../../components/Loading";

const ManageUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // Thêm state
  const [selectedUserId, setSelectedUserId] = useState([]); // Thêm state
  const [openAlert, setOpenAlert] = useState(false); // State cho AlertDialog
  const [alertMessage, setAlertMessage] = useState(""); // Message cho AlertDialog
  const [isLoading, setIsLoading] = useState(false);

  const [userNameSearch, setUserNameSearch] = useState(null); // Tìm kiếm theo tên tài khoản
  const [codeSearch, setCodeSearch] = useState(null); // Tìm kiếm theo mã tài khoản
  const [fullNameSearch, setFullNameSearch] = useState(null);
  const [phoneSearch, setPhoneSearch] = useState(null);
  const [emailSearch, setEmailSearch] = useState(null);
  const [roleCodeSearch, setRoleCodeSearch] = useState(null);

  // Hàm gọi API tìm kiếm với phân trang
  // const fetchDataSearch = async () => {
  //   try {
  //     let token = localStorage.getItem("authToken");
  //     if (!token) {
  //       window.location.href = "/login";
  //       return;
  //     }

  //     // Cấu hình headers
  //     const headers = {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     };

  //     // Cấu hình body cho request
  //     const requestBody = {
  //       pageSize: pageSize,
  //       pageIndex: page + 1,
  //       userName: userNameSearch,
  //       code: codeSearch,
  //       fullName: fullNameSearch,
  //     };

  //     // Gửi yêu cầu POST để lấy dữ liệu
  //     const response = await Axios.post("/sys-user/search", requestBody, {
  //       headers,
  //     });

  //     // Kiểm tra phản hồi từ server
  //     const data = response.data;

  //     // Cập nhật dữ liệu người dùng và tổng số bản ghi
  //     const userArray = Array.isArray(data.data.content)
  //       ? data.data.content
  //       : [];
  //     setUserData(userArray);
  //     setTotalItems(data.data.totalElements || 0);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // Hàm gọi API
  const fetchUserData = async (page, pageSize) => {
    try {
      let token = localStorage.getItem("authToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Cấu hình headers
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const requestBody = {
        pageSize: pageSize,
        pageIndex: page + 1,
        userName: userNameSearch,
        code: codeSearch,
        fullName: fullNameSearch,
        phone: phoneSearch,
        email: emailSearch,
        roleCode: roleCodeSearch,
      };

      // Gửi yêu cầu lấy dữ liệu người dùng
      let response = await Axios.post("/sys-user/search", requestBody, {
        headers,
      });

      // Kiểm tra mã 401
      if (response.status === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token
        if (refreshed) {
          token = localStorage.getItem("authToken"); // Cập nhật token mới
          headers.Authorization = `Bearer ${token}`; // Cập nhật headers

          // Thực hiện lại yêu cầu với token mới
          response = await Axios.post("/sys-user/search", requestBody, {
            headers,
          });
        } else {
          console.error("Cannot refresh token. Redirecting to login.");
          window.location.href = "/login"; // Điều hướng đến trang đăng nhập
          return;
        }
      }

      // Kiểm tra phản hồi từ server
      const data = response.data;
      console.log("Received data:", data);

      // Cập nhật dữ liệu người dùng
      const userArray = Array.isArray(data.data.content)
        ? data.data.content
        : [];
      setUserData(userArray);
      setTotalItems(data.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchUserData(
        page,
        pageSize,
        userNameSearch,
        codeSearch,
        fullNameSearch,
        phoneSearch,
        emailSearch,
        roleCodeSearch
      );
      setIsLoading(false);
    };

    fetchData();
  }, [
    page,
    pageSize,
    userNameSearch,
    codeSearch,
    fullNameSearch,
    phoneSearch,
    emailSearch,
    roleCodeSearch
  ]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleClickOpenForm = (user = null) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
  };

  const fetchUserById = async (id) => {
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Thiết lập headers
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Gửi yêu cầu lấy thông tin user
      let response = await Axios.get(`/sys-user/${id}`, { headers });

      // Kiểm tra mã 401
      if (response.status === 401) {
        const refreshed = await refreshToken(); // Gọi hàm làm mới token
        if (refreshed) {
          token = localStorage.getItem("authToken"); // Cập nhật token mới
          headers.Authorization = `Bearer ${token}`; // Cập nhật headers

          // Thực hiện lại yêu cầu với token mới
          response = await Axios.get(`/sys-user/${id}`, { headers });
        } else {
          console.error("Cannot refresh token. Redirecting to login.");
          window.location.href = "/login"; // Điều hướng đến trang đăng nhập
          return;
        }
      }

      // Kiểm tra mã phản hồi sau khi thử lại
      if (!response.data) {
        throw new Error("Failed to fetch user data");
      }

      const user = response.data;
      return user; // Trả về thông tin người dùng
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const handleEditUser = async (id) => {
    const user = await fetchUserById(id);

    if (user && user.data) {
      const roles = Array.isArray(user.data.listRole)
        ? user.data.listRole.map((role) => ({
            id: role.id,
            code: role.code,
            name: role.name,
          }))
        : [];

      // Cập nhật thông tin người dùng vào state, bao gồm cả danh sách roles
      setSelectedUser({
        id: user.data.id,
        userName: user.data.userName,
        code: user.data.code,
        fullName: user.data.fullName,
        phone: user.data.phone,
        roles: roles, // Truyền listRole
        dob: user.data.dob,
        email: user.data.email,
      });

      setOpen(true);
    } else {
      console.error("User data is not in the expected format or not found.");
    }
  };

  const handleDeleteUser = (ids) => {
    if (ids.length === 0) {
      setAlertMessage("Vui lòng chọn ít nhất một người dùng để xóa.");
      setOpenAlert(true);
      return;
    }

    setSelectedUserIds(ids); // Lưu lại danh sách ID cần xoá
    setAlertMessage(
      "Bạn có chắc chắn muốn xoá những người dùng đã chọn không?"
    );
    setOpenAlert(true); // Hiển thị AlertDialog
  };

  const handleDeleteOneUser = (id) => {
    setSelectedUserId([id]); // Lưu lại danh sách ID cần xoá
    setAlertMessage(
      "Bạn có chắc chắn muốn xoá những người dùng đã chọn không?"
    );
    setOpenAlert(true);
  };

  const handleAlertDialogClose = async (confirmed) => {
    setOpenAlert(false);

    if (!confirmed) return;
    setIsLoading(true);
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        console.error("Token không tồn tại.");
        window.location.href = "/login"; // Điều hướng về trang đăng nhập
        return;
      }

      // Thiết lập headers
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      console.log(selectedUserIds, " / ", selectedUserId);

      // Gửi yêu cầu xoá user
      let response = await Axios.post(
        "/sys-user/delete",
        selectedUserIds.length === 0 ? selectedUserId : selectedUserIds,
        {
          headers,
        }
      );

      const result = response.data;
      // Kiểm tra mã phản hồi từ API
      if (result.code === 200) {
        Notification(result.message, "SUCCESS"); // Thông báo thành công
        fetchUserData(page, pageSize); // Fetch lại dữ liệu sau khi xóa
      } else {
        Notification(
          result.message || "Đã xảy ra lỗi khi xóa người dùng.",
          "ERROR"
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || "Có lỗi xảy ra"; // Thông báo lỗi
      console.error("Error deleting users:", error);
      Notification(message, "ERROR"); // Thông báo lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    await ExportData(
      userNameSearch,
      codeSearch,
      fullNameSearch,
      phoneSearch,
      emailSearch,
      roleCodeSearch
    );
  };

  const ExportData = async () => {
    try {
      const requestData = {
        pageIndex: 1,
        pageSize: 10000,
        userName: userNameSearch,
        code: codeSearch,
        fullName: fullNameSearch,
        phone: phoneSearch,
        email: emailSearch,
        roleCode:roleCodeSearch,
      };
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(`/sys-user/export`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Đảm bảo nhận dữ liệu dưới dạng blob
      });

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Xuất dữ liệu người dùng.xlsx"); // Tên tệp tải về
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
      field: "stt",
      headerName: "STT",
      headerAlign: "center",
      width: 90,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Lấy thứ tự của hàng
    },    {
      field: "actions",
      headerName: "Hành động",
      headerAlign: "center",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEditUser(params.id)}
            color="secondary"
            disabled={!hasPermission("UPDATE_ACCOUNT")}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteOneUser(params.id)}
            color="warning"
            disabled={!hasPermission("DELETE_ACCOUNT")}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "userName",
      headerName: "Tên tài khoản",
      width: 200,
      headerAlign: "center",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setUserNameSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "code",
      headerName: "Mã tài khoản",
      width: 150,
      headerAlign: "center",
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
      field: "fullName",
      headerName: "Họ Tên",
      width: 200,
      headerAlign: "center",
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setFullNameSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      headerAlign: "center",
      width: 150,
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "roleCodes",
      headerName: "Chức vụ",
      headerAlign: "center",
      width: 200,
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setRoleCodeSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    
    },
    {
      field: "email",
      headerName: "Email",
      headerAlign: "center",
      width: 200,
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            onChange={(e) => setEmailSearch(e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      sortable: false,
    },
    {
      field: "createAt",
      headerName: "Thời gian tạo",
      width: 180,
      headerAlign: "center",
      type: "dateTime",
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
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
          <Header title="Tài khoản" subtitle="Quản lý tài khoản" />
          <Box display="flex" gap="10px">
            {hasPermission("CREATE_ACCOUNT") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleClickOpenForm(null)}
              >
                Thêm tài khoản
              </Button>
            )}

            {hasPermission("DELETE_ACCOUNT") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={() => handleDeleteUser(selectedUserIds)} // Xóa nhiều người dùng
                disabled={selectedUserIds.length === 0} // Vô hiệu hóa nếu không có người dùng nào được chọn
              >
                Xoá tài khoản
              </Button>
            )}

            {hasPermission("IMPORT_ACCOUNT") && (
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: colors.blueAccent[700] }}
                onClick={handleClickOpenImport}
              >
                Nhập file
              </Button>
            )}

            {hasPermission("EXPORT_ACCOUNT") && (
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
          {hasPermission("VIEW_ACCOUNT") ? (
            <DataGrid
              checkboxSelection
              loading={isLoading}
              rows={userData || []}
              columns={columns}
              page={page}
              pageSize={pageSize}
              rowCount={totalItems}
              pagination
              componentsProps={{
                pagination: {
                  labelRowsPerPage: "Số hàng",
                },
              }}
              localeText={{
                MuiTablePagination: {
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`,
                },
              }}
              paginationMode="server"
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 15, 20]}
              onSelectionModelChange={(newSelection) => {
                setSelectedUserIds(newSelection); // Cập nhật danh sách ID được chọn
              }}
              headerHeight={60} // Tăng chiều cao header để vừa nội dung
              className="bg-white shadow rounded"
            />
          ) : (
            <p>Bạn không có quyền xem thông tin</p>
          )}
        </Box>

        {/* Mở form */}
        <Dialog open={open} onClose={handleCloseForm} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedUser ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
          </DialogTitle>
          <DialogContent>
            <Form
              selectedUser={selectedUser}
              refresh={() => fetchUserData(page, pageSize)}
              onCloseForm={handleCloseForm}
              formikRef={formikRef} // Truyền ref vào Form component
            />{" "}
            {/* Truyền thông tin người dùng cho form */}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseForm}
              color="primary"
              sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            >
              Huỷ bỏ
            </Button>
            <Button
              onClick={() => formikRef.current.submitForm()} // Submit form từ Dialog
              color="secondary"
              variant="contained"
            >
              {selectedUser ? "Cập nhật" : "Tạo mới"}
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
          <DialogTitle>Nhập file dữ liệu người dùng</DialogTitle>
          <DialogContent>
            <ImportExcelDialog
              type={"sys-user"}
              name={"tài khoản"}
              refresh={() => fetchUserData(page, pageSize)}
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

export default ManageUser;
