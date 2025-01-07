import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import { refreshToken } from "../../components/RefreshToken";

const AreaContractInPass = () => {
  const token = localStorage.getItem("authToken") || "";
  const { areaCode } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const navigate = useNavigate(); // Điều hướng đến trang đăng nhập nếu cần

  useEffect(() => {
    fetchDataHistory(page, pageSize);
  }, [page, pageSize]);

  const handleOpenDetailDialog = (rowData = null) => {
    setSelectedRow(rowData);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedRow(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const fetchDataHistory = async (page, size) => {

    try {
      const url = `/contract/search-contract-history?areaCode=${areaCode}&page=${
        page + 1
      }&size=${size}`;
      let token = localStorage.getItem("authToken");

      let response = await Axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data;

      if (responseData.code === 200) {
        setRows(responseData.data.data);
        setTotalItem(responseData.data.totalPage || 0);
      } else if (responseData.code === 401) {
        console.warn("Token hết hạn, đang thử làm mới...");

        // làm mới token
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) {
          token = localStorage.getItem("authToken"); // Lấy token mới

          // Gọi lại API với token mới
          response = await Axios.get(url, {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          });

          const refreshedData = response.data;
          if (refreshedData.code === 200) {
            setRows(refreshedData.data.data);
            setTotalItem(refreshedData.data.totalPage || 0);
          } else {
            Notification(
              "Không thể tải dữ liệu sau khi làm mới token.",
              "ERROR"
            );
          }
        } else {
          Notification("Phiên đã hết hạn, vui lòng đăng nhập lại.", "ERROR");
          navigate("/login");
        }
      } else {
        console.error("Lỗi khi lấy dữ liệu:", responseData.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  const columns = [
    { field: "name", headerName: "Tên", flex: 1 },
    { field: "code", headerName: "Mã", flex: 1 },
    { field: "industrialParkCode", headerName: "Mã KCN", flex: 1 },
    { field: "startDate", headerName: "Ngày Bắt Đầu", flex: 1, type: "date" },
    { field: "endDate", headerName: "Ngày Kết Thúc", flex: 1, type: "date" },
    {
      field: "expired",
      headerName: "Trạng thái",
      flex: 1,
      cellClassName: (params) =>
        params.value ? "text-red-500 font-bold" : "text-green-500 font-bold",
      renderCell: (params) => (
        <span>{params.value ? "Hết hạn" : "Còn hạn"}</span>
      ),
    }
  ];

  const lesseeColumns = [
    { field: "lessee", headerName: "Tên bên thuê", flex: 1 },
    { field: "representativeLessee", headerName: "Người đại diện", flex: 1 },
    { field: "lesseePhone", headerName: "SĐT", flex: 1 },
  ];

  const lessorColumns = [
    { field: "lessor", headerName: "Tên bên cho thuê", flex: 1 },
    { field: "representativeLessor", headerName: "Người đại diện", flex: 1 },
    { field: "lessorPhone", headerName: "SĐT", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Header title="Hợp đồng cũ" subtitle="Xem hợp đồng cũ của khu đất" />
      </Box>
      <Box
        height="73vh"
        sx={{
          overflow: "auto",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
        <DataGrid
          rows={rows || []}
          columns={columns}
          getRowId={(row) => row.code}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 15, 20]}
          rowCount={totalItem * pageSize}
          paginationMode="server"
          onRowClick={(params) => handleOpenDetailDialog(params.row)}
        />
      </Box>

      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin chi tiết hợp đồng</DialogTitle>
        <DialogContent>
          <div>
            <h2 className="text-lg font-semibold">
              Thông tin chi tiết hợp đồng
            </h2>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <Box sx={{ width: "48%" }}>
                <h3 className="text-md font-semibold">Thông tin chung</h3>
                <DataGrid
                  rows={selectedRow ? [selectedRow] : []}
                  columns={columns}
                  getRowId={(row) => row.code}
                  autoHeight
                  hideFooter
                  disableColumnMenu
                />
              </Box>
              <Box sx={{ width: "48%" }}>
                <h3 className="text-md font-semibold">Thông tin bên thuê</h3>
                <DataGrid
                  rows={selectedRow ? [selectedRow] : []}
                  columns={lesseeColumns}
                  getRowId={(row) => row.code}
                  autoHeight
                  hideFooter
                  disableColumnMenu
                />
                <h3
                  className="text-md font-semibold"
                  style={{ marginTop: "16px" }}
                >
                  Thông tin bên cho thuê
                </h3>
                <DataGrid
                  rows={selectedRow ? [selectedRow] : []}
                  columns={lessorColumns}
                  getRowId={(row) => row.code}
                  autoHeight
                  hideFooter
                  disableColumnMenu
                />
              </Box>
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AreaContractInPass;
