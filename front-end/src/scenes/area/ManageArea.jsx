import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Form from "../form/AddAreaForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Axios from "../../components/Axios";
import { Link } from "react-router-dom";
import Notification from "../../components/Notification";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import ImportExcelDialog from "../files/ImportExcelDialog";
import { hasPermission } from "../login/DecodeToken";
import showAlertDialog from "../../components/ShowAlertDialog";
const Area = ({ code, parkId }) => {
  const token = localStorage.getItem("authToken") || "";

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false); // State cho dialog Import
  const [selectedRow, setSelectedRow] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
  const [rows, setRows] = useState([]); // Lưu trữ danh sách Industrial Parks

  const [page, setPage] = useState(0);

  const [name, setName] = useState("");
  const [codeArea, setCodeArea] = useState("");
  const [state, setState] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);

  useEffect(() => {
    console.log(hasPermission("MANAGE_AREA"));

    // Check for permission when component mounts
    if (!(hasPermission("VIEW_AREA") || hasPermission("MANAGE_AREA") || hasPermission("MANAGE_INDUSTRIAL_PARK"))) {
      navigate("/dashboard"); // or redirect to any other page
    }
  }, [navigate]);

  const [selectedRows, setSelectedRows] = useState([]);
  const handleExport = async () => {
    await ExportData();
  };

  const handleSearchChange = (type, searchTerm) => {
    switch (type) {
      case "name":
        setName(searchTerm);
        break;
      case "code":
        setCodeArea(searchTerm);
        break;
      case "state":
        setState(searchTerm);
        break;
      default:
        break;
    }

    // Thực hiện gọi lại API với giá trị mới
    fetchDataArea(
      page,
      pageSize,
      type === "name" ? searchTerm : name,
      type === "code" ? searchTerm : codeArea,
      type === "state" ? searchTerm : state
    );
  };

  const ExportData = async () => {
    try {
      const requestData = {
        industrialParkCode: code,
        page: 1,
        size: 10000,
        code: codeArea,
        name: name,
        state: state,
      };

      const response = await Axios.post(`/area/export`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Đảm bảo nhận dữ liệu dưới dạng blob
      });

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Xuất dữ liệu khu đất.xlsx"); // Tên tệp tải về
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
  const handleClickOpenForm = (rowData = null) => {
    setSelectedRow(rowData); // Lưu dữ liệu hàng được chọn (nếu có) vào state
    setOpenFormDialog(true);
  };

  const handleClickOpenVr360 = (row) => {
    console.log(row.code);
    navigate("/home", { state: { code: code, hotspot: row.hotspot } });
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true); // Mở dialog import
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedRow(null); // Reset lại sau khi đóng form
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false); // Đóng dialog import
  };

  useEffect(() => {
    const fetchDataArea1 = async () => {
      setIsLoading(true);
      await fetchDataArea(page, pageSize, name, codeArea, state);
      setIsLoading(false);
    };
    fetchDataArea1();
  }, [page, pageSize, name, codeArea, state]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset page to 1 when page size changes
  };

  const formikRef = useRef();

  const fetchDataArea = async (page, size, name, codeArea, state) => {
    try {
      const url = `/area/search?industrialParkCode=${code}&page=${page + 1}&size=${size}`
      + (name ? `&name=${encodeURIComponent(name)}` : "")
      + (codeArea ? `&code=${encodeURIComponent(codeArea)}` : "")
      + (state ? `&state=${encodeURIComponent(state)}` : "");

      const response = await Axios.get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      let responeData = response.data.data;

      setRows(responeData.data);
      setTotalItem(responeData.totalElements);
    } catch (error) {
      console.error("Error fetching scenes:", error);
    }
  };

  const DeleteArea = async (id) => {
    try {
      console.log(">> id: ", id);

      const postData = Array.isArray(id) ? id : [id];
      console.log(">> postdata: ", postData);

      const response = await Axios.post(`/area/delete`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let responseData = response.data;
      if (responseData.code !== 200) {
        Notification(responseData.message, "WARNING");
        return;
      }
      Notification(responseData.message, "SUCCESS");
      fetchDataArea(page, pageSize);
    } catch (error) {
      console.error("Error deleting area:", error);
      Notification(error.response?.data?.message, "WARNING");
    }
  };

  const handleClickOff = () => {
    Notification("Chưa có vùng đất nào được gắn trên vr360", "WARNING");
  };

  // Hàm xóa Industrial Park theo id
  const handleDelete = async (id) => {
    const confirmDelete = await showAlertDialog("Bạn có muốn xóa khu đất này?");

    if (!confirmDelete) return;

    await DeleteArea(id);
  };

  const handleDeleteMultiple = async () => {
    const confirmDelete = await showAlertDialog(
      "Bạn có muốn xóa các khu đất đã chọn?"
    );
    if (!confirmDelete) return;

    if (selectedRows.length === 0) {
      Notification("Vui lòng chọn ít nhất một khu đất để xóa.", "WARNING");
      return;
    }

    await DeleteArea(selectedRows);
    setSelectedRows([]); // Xóa xong thì reset danh sách đã chọn
  };

  const columns = [
    {
      field: "action",
      headerName: "Xem bằng vr 360",
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          <IconButton>
            {params.row.hotspot.hotspotName ? (
              <VisibilityIcon
                onClick={() => handleClickOpenVr360(params.row)}
              />
            ) : (
              <VisibilityOffIcon
                onClick={() => {
                  handleClickOff();
                }}
              />
            )}
          </IconButton>
        </Box>
      ),
      flex: 1,
      sortable: false,
      filterable: false,
    },
    {
      field: "actions",
      headerName: "Hành động",
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          {(hasPermission("UPDATE_AREA") ||
            hasPermission("MANAGE_AREA") ||
            hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
            <IconButton
              onClick={() => handleClickOpenForm(params.row)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          )}
          {(hasPermission("DELETE_AREA") ||
            hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
            <IconButton
              onClick={() => handleDelete(params.row.id)}
              color="warning"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
      flex: 1,
      sortable: false,
      filterable: false,
    },
    {
      field: "code",
      headerName: "Mã",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box className=" flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            value={codeArea}
            onChange={(e) => handleSearchChange("code", e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Tên",
      headerAlign: "center",
      flex: 1,
      sortable: false,
      filterable: false,
      cellClassName: "name-column--cell",
      renderCell: (params) => (
        <Link
          to={`${params.row.code}/${params.row.id}`}
          className="text-blue-500 cursor-pointer underline"
        >
          {params.value}
        </Link>
      ),
      renderHeader: (params) => (
        <Box className=" flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            value={name}
            onChange={(e) => handleSearchChange("name", e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Miêu tả",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "square",
      headerName: "Diện tích",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "userCode",
      headerName: "Người quản lý",
      headerAlign: "center",
      flex: 1,
      sortable: false,
    },
    {
      field: "state",
      headerName: "Trạng thái",
      headerAlign: "center",
      flex: 1,
      width: 200,
      sortable: false,
      renderCell: (params) => {
        let stateLabel = "";
        let stateColor = "";

        switch (params.value) {
          case "IDLE":
            stateLabel = "Chưa cho thuê";
            stateColor = "red";
            break;
          case "LEASED":
            stateLabel = "Đã cho thuê";
            stateColor = "green";
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
      renderHeader: (params) => (
        <Box className="flex flex-col items-center justify-center leading-7 w-full">
          {/* Hiển thị tiêu đề cột */}
          <Box>{params.colDef.headerName}</Box>
          {/* Dropdown Select */}
          <FormControl size="small" fullWidth sx={{ width: "100%" }}>
            <Select
              value={state} // Giá trị hiện tại của dropdown
              onChange={(e) => handleSearchChange("state", e.target.value)} // Thay đổi giá trị
              displayEmpty // Hiển thị giá trị mặc định
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="IDLE">Chưa cho thuê</MenuItem>
              <MenuItem value="LEASED">Đã cho thuê</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        const formattedDate = new Date(params.value).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return <span>{formattedDate}</span>;
      },
    },
  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Header title="Khu đất" subtitle="Quản lý khu đất" />
        <Box display="flex" gap="10px">
          {" "}
          {/* Thêm Box với gap để điều chỉnh khoảng cách */}
          {(hasPermission("CREATE_AREA") ||
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
          {(hasPermission("DELETE_AREA") ||
            hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleDeleteMultiple}
              disabled={selectedRows.length === 0}
            >
              Xóa
            </Button>
          )}
          {(hasPermission("IMPORT_AREA") ||
            hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleClickOpenImport} // Mở dialog Import
            >
              Nhập file
            </Button>
          )}
          {(hasPermission("EXPORT_AREA") ||
            hasPermission("MANAGE_AREA") ||
            hasPermission("MANAGE_INDUSTRIAL_PARK")) && (
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleExport}
            >
              Xuất file
            </Button>
          )}
        </Box>
        {/* {/* <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
          onClick={() => handleClickOpenForm(null)} // Mở form để tạo mới khi không có hàng được chọn
        >
          Add
        </Button> */}
        {/* <Button
          variant="contained"
          color="primary"
          sx={{ backgroundColor: colors.blueAccent[700] }}
        >
          Delete
        </Button> */}
        {/* <Button
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
        </Button>  */}
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
        <DataGrid
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          rows={rows || []}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          componentsProps={{
            pagination: {
              labelRowsPerPage: "Số hàng",
            },
          }}
          loading={isLoading}
          localeText={{
            MuiTablePagination: {
              labelDisplayedRows: ({ from, to, count }) =>
                `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`,
            },
            noRowsLabel: "Không có dữ liệu",
          }}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 15, 20]}
          rowCount={totalItem}
          paginationMode="server"
          headerHeight={60}
        />
      </Box>

      {/* Dialog cho Form Create/Edit */}
      <Dialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRow ? "Chỉnh sửa khu đất" : "Thêm khu đất"}
        </DialogTitle>
        <DialogContent>
          <Form
            rowData={selectedRow}
            industrialParkCode={code}
            refresh={() => fetchDataArea(page, pageSize)}
            formikRef={formikRef}
            onCloseForm={handleCloseFormDialog}
          />{" "}
          {/* Truyền dữ liệu hàng đã chọn vào form */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => formikRef.current.submitForm()} // Submit form từ Dialog
            color="secondary"
            variant="contained"
          >
            {selectedRow ? "Cập nhật" : "Tạo mới"}
          </Button>

          <Button
            onClick={handleCloseFormDialog}
            color="primary"
            sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
          >
            Hủy
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
        <DialogTitle>Nhập file khu đất</DialogTitle>
        <DialogContent>
          <ImportExcelDialog
            type={"area"}
            parkId={parkId}
            name={"khu đất"}
            onClose={handleCloseImportDialog}
            refresh={() => fetchDataArea(page, pageSize)}
          />
        </DialogContent>
        {/* <DialogActions>
          <Button
            onClick={handleCloseImportDialog}
            color="primary"
            sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
          >
            Hủy
          </Button>
        </DialogActions> */}
      </Dialog>
    </Box>
  );
};

export default Area;
