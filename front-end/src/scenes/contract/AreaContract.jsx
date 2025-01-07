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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Form from "../form/InsertAreaToContract";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import { refreshToken } from "../../components/RefreshToken";
import AlertDialog from "../../components/AlertDialog";
import Notification from "../../components/Notification";
import Axios from "../../components/Axios";
import { useRef } from "react";

const AreaContract = ({ basicInfo }) => {
  const theme = useTheme();
  const formikRef = useRef();
  const { parkCode, code } = useParams(); // Lấy mã từ url
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // Bắt đầu từ trang 0
  const [pageSize, setPageSize] = useState(10); // Số hàng mỗi trang
  const [totalRows, setTotalRows] = useState(0); // Tổng số hàng trong DB

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [selectedAreaInContract, setSelectedAreaInContract] = useState(null);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]); // State for selected area IDs
  const [openAlert, setOpenAlert] = useState(false); // State for AlertDialog
  const [alertMessage, setAlertMessage] = useState(""); // Message for AlertDialog

  // Hàm fetch dữ liệu khu đất có hợp đồng
  const fetchAreaHasContractData = useCallback(
    async (page, size) => {
      let authToken = localStorage.getItem("authToken");

      if (!authToken) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      try {
        let response = await Axios.get(
          `/area/get-area-in-contract/${code}?page=${page + 1}&size=${size}`,
          { headers }
        );

        // Nếu gặp lỗi 401, thử làm mới token
        if (response.status === 401) {
          console.log("Token hết hạn. Đang làm mới...");

          const refreshed = await refreshToken(); // Gọi hàm làm mới token

          if (refreshed) {
            // Cập nhật token mới và gửi lại request
            authToken = localStorage.getItem("authToken");
            headers.Authorization = `Bearer ${authToken}`;

            response = await Axios.get(
              `/area/get-area-in-contract/${code}?page=${
                page + 1
              }&size=${size}`,
              { headers }
            );
          } else {
            console.log("Refresh token không hợp lệ. Chuyển đến login.");
            window.location.href = "/login";
            return;
          }
        }

        if (response.status !== 200) throw new Error("Không thể lấy dữ liệu");

        const data = response.data;
        setRows(data.data.data || []); // Cập nhật state với dữ liệu
        setTotalRows(data.data.totalElements || 0); // Cập nhật tổng số hàng
      } catch (error) {
        console.error("Error fetching area data:", error);
        setRows([]); // Đặt dữ liệu về mảng rỗng nếu gặp lỗi
      }
    },
    [code]
  );

  const handleDeleteArea = () => {
    if (selectedAreaIds.length === 0) {
      setAlertMessage("Vui lòng chọn khu đất để xóa.");
      setOpenAlert(true);
      return;
    }

    setAlertMessage(
      "Bạn có chắc chắn muốn xóa các khu đất đã chọn khỏi hợp đồng không?"
    );
    setOpenAlert(true);
  };

  const handleSingleDelete = (id) => {
    setSelectedAreaIds([id]); // Chỉ đặt ID của hàng được chọn
    setAlertMessage(
      "Bạn có chắc chắn muốn xóa khu đất này khỏi hợp đồng không?"
    );
    setOpenAlert(true);
  };

const handleAlertDialogClose = async (confirmed) => {
  setOpenAlert(false);

  if (!confirmed) return;

  try {
    let token = localStorage.getItem("authToken");

    if (!token) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    const requestBody = {
      contractCode: code, // mã hợp đồng
      areas: selectedAreaIds, // danh sách ID khu vực cần xóa
    };

    console.log(requestBody);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    let response = await Axios.post(
      "/contract/remove-area-in-contract", // API xóa khu vực
      requestBody,
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
          "/contract/remove-area-in-contract",
          requestBody,
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
      fetchAreaHasContractData(page, pageSize); // Fetch lại dữ liệu sau khi xóa
      setSelectedAreaIds([]); // Reset danh sách ID đã chọn
    } else {
      Notification(
        result.message || "Đã xảy ra lỗi khi xóa khu vực.",
        "ERROR"
      );
    }
  } catch (error) {
    console.error("Error deleting area:", error);
    Notification(
      "Có lỗi xảy ra khi xóa khu vực. Vui lòng thử lại sau.",
      "ERROR"
    );
  }
};


  // Gọi API khi trang hoặc kích thước trang thay đổi
  useEffect(() => {
    if (parkCode) {
      fetchAreaHasContractData(page, pageSize);
    }
  }, [fetchAreaHasContractData, page, pageSize]);

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <Box>
          <IconButton
            color="warning"
            disabled={basicInfo.expired}
            onClick={() => handleSingleDelete(params.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      width: 80,
      sortable: false,
      filterable: false,
      align: "center",
    },
    { field: "id", headerName: "ID" },
    { field: "code", headerName: "Mã khu đất", flex: 1 },
    { field: "name", headerName: "Tên khu đất", flex: 1 },
    { field: "description", headerName: "Mô tả", flex: 1 },
    { field: "square", headerName: "Diện tích", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 1 },
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
          <Header title="Khu đất" subtitle="Danh sách khu đất trong hợp đồng" />
          <Box display="flex" gap="10px">
            {basicInfo.expired}

            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              disabled={basicInfo.expired} // Disable nếu expired là true
              onClick={() => setOpenFormDialog(true)}
            >
              Gán khu đất
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleDeleteArea} // Xóa khu đất
              disabled={basicInfo.expired || selectedAreaIds.length === 0} // Disable nếu expired là true hoặc không có khu đất nào được chọn
            >
              Xoá khu đất khỏi hợp đồng
            </Button>
          </Box>
        </Box>

        <Box height="73vh" sx={{ overflow: "auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            page={page}
            pageSize={pageSize}
            rowCount={totalRows}
            paginationMode="server"
            rowsPerPageOptions={[10, 15, 20]}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            checkboxSelection
            onSelectionModelChange={(newSelection) => {
              setSelectedAreaIds(newSelection); // Lưu trữ ID đã chọn
            }}
          />
        </Box>

        <Dialog
          open={openFormDialog}
          onClose={() => setOpenFormDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedAreaInContract ? "Sửa khu đất" : "Thêm khu đất"}
          </DialogTitle>
          <DialogContent>
            <Form
              selectedAreaInContract={selectedAreaInContract}
              refresh={() => fetchAreaHasContractData(page, pageSize)}
              onCloseForm={() => setOpenFormDialog(false)}
              formikRef={formikRef} // Truyền ref vào Form component
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFormDialog(false)} color="primary">
              Huỷ
            </Button>
            <Button onClick={() => formikRef.current.submitForm()}  color="secondary" variant="contained">
                Thêm khu vực
              </Button>
          </DialogActions>
              
        </Dialog>
      </Box>
    </>
  );
};

export default AreaContract;
