import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  TextField
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Form from "../form/AddIndustrialParkForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Axios from "../../components/Axios";
import { useNavigate } from 'react-router-dom';
import AddVtourForm from '../form/AddVtourForm'
import Add from "@mui/icons-material/Add";
import Notification from "../../components/Notification";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ImportExcelDialog from "../files/ImportExcelDialog";
import { hasPermission } from "../login/DecodeToken";
import showAlertDialog from "../../components/ShowAlertDialog"; // Import AlertDialog
import { LoadingButton } from "@mui/lab";

const IndustrialPark = () => {
  let token = localStorage.getItem("authToken") || "";
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openAddTourDialog, setOpenAddTourDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openTextDialog, setOpenTextDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
  const [rows, setRows] = useState([]); // Lưu trữ danh sách Industrial Parks

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const [disableCancel, setDisableCancel] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);

  useEffect(() => {
    // Check for permission when component mounts
    if (!(hasPermission("VIEW_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK") || hasPermission("MANAGE_AREA"))) {
      navigate("/dashboard"); // or redirect to any other page
    }
  }, [navigate]);

  const handleSearchChange = (type, searchterm) => {
    if (type === "name") {

      fetchDataIndustrialPark(page, pageSize, searchterm, code, address);
      setName(searchterm);
    }
    if (type === "code") {
      fetchDataIndustrialPark(page, pageSize, name, searchterm, address);
      setCode(searchterm);
    }
    if (type === "address") {
      fetchDataIndustrialPark(page, pageSize, name, code, searchterm);
      setAddress(searchterm);
    }

  };

  const handleClickOpenForm = (rowData = null) => {
    setSelectedRow(rowData); // Lưu dữ liệu hàng được chọn (nếu có) vào state
    setOpenFormDialog(true);
  };

  const handleClickOpenImport = () => {
    setOpenImportDialog(true); // Mở dialog import
  };

  const handleCloseTextDialog = () => {
    setOpenTextDialog(false);
  }

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedRow(null); // Reset lại sau khi đóng form
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false); // Đóng dialog import
  };
  const handleClickOpenVr360 = (row) => {
    console.log(row.code);
    navigate('/home', { state: { code: row.code, name: row.name } });
  }

  const handleOpenAddVtour = (rowData = null) => {
    setSelectedRow(rowData); // Lưu dữ liệu hàng được chọn (nếu có) vào state
    setOpenAddTourDialog(true);
  }
  const handleViewOff = () => {
    Notification("Cần phải tạo vtour trước", "WARNING");
  }
  const handleCloseAddVtour = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenAddTourDialog(false);
    }
  }

  const handleOpenEdit = (rowData) => {
    setSelectedRow(rowData);
    setOpenTextDialog(true);
  }
  const handleExport = async () => {
    await ExportData();
  }

  const ExportData = async () => {
    try {
      const requestData = {
        page: 1,
        size: 10000,
        name:name,
        address:address,
        code:code
      };
      console.log(requestData);
      
      const response = await Axios.post(
        `/industrial-park/export-excel`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob' // Đảm bảo nhận dữ liệu dưới dạng blob
        }
      );

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Xuất dữ liệu khu công nghiệp.xlsx'); // Tên tệp tải về
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Thông báo thành công
      Notification("Tải xuống thành công", "SUCCESS");
    } catch (error) {
      console.error('Error exporting data:', error);
      Notification(error.responseData?.message || "Có lỗi xảy ra", "WARNING");
    }
  };

  const DeleteIndustrialPark = async (code) => {

    try {
      const postData = Array.isArray(code) ? code : [code];
      const requestData = {
        listCode: postData
      };

      const response = await Axios.post(`/industrial-park/delete`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let responseData = response.data;
      console.log(responseData);

      if (responseData.code !== 200) {
        Notification(responseData.message, "WARNING");
        return;
      }
      Notification(responseData.message, "SUCCESS");
      const updatedRows = rows.filter((row) => !postData.includes(row.code));
      setRows(updatedRows);
    } catch (error) {
      console.error('Error deleting area:', error);
      Notification(error.responseData?.message, "WARNING");
    }
  }
  const fetchDataIndustrialPark = async (page, size, name, code, address) => {
    try {

      // const apiEndpoint = `/industrial-park/search?page=${page + 1}&size=${size}${searchTerm ? searchTerm : ''}`;

      const apiEndpoint = `/industrial-park/search?page=${page + 1}&size=${size}${(name && name.length !== 0) ? `&name=${name}` : ''}${code && code.length !== 0 ? `&code=${code}` : ""}${address && address.length !== 0 ? `&address=${address}` : ""}`;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Make sure token is defined
      };

      const response = await Axios.get(apiEndpoint, { headers });
      const responseData = response.data.data;
      console.log(responseData);

      // Only update state if data has actually changed
      if (JSON.stringify(responseData.data) !== JSON.stringify(rows)) {
        setRows(responseData.data);
      }

      setTotalItem(responseData.totalElements || 0);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchDataIndustrialPark(page, pageSize,name, code, address);
      setIsLoading(false);
    };

    fetchData();
  }, [page, pageSize,name, code, address]);

  // Hàm xóa Industrial Park theo id
  const handleDelete = async (id) => {

    const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn xóa khu công nghiệp này?");
    if (!confirmDelete) return;

    // AlertDialog(true,"asdsd",);
    setIsLoading(true);
    await DeleteIndustrialPark(id);
    setIsLoading(false);
  };

  const handleDeleteMultiple = async () => {
    const confirmDelete = await showAlertDialog("Bạn có muốn xóa các khu công nghiệp này đã chọn?");
    if (!confirmDelete) return;

    if (selectedRows.length === 0) {
      Notification("Vui lòng chọn ít nhất một khu đất để xóa.", "WARNING");
      return;
    }

    await DeleteIndustrialPark(selectedRows);
    setSelectedRows([]); // Xóa xong thì reset danh sách đã chọn
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset page to 1 when page size changes
  };
  const formikRef = useRef();

  const columns = [
    {
      field: "view360",
      headerName: "Xem bằng vr360",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          {
            params.row.hasTour === true ? (
              <IconButton
                onClick={() =>
                  handleClickOpenVr360(params.row)
                }
              >
                <VisibilityIcon />
              </IconButton>
            )
              :
              (
                <IconButton>
                  <VisibilityOffIcon onClick={() => handleViewOff()} />
                </IconButton>
              )
          }
        </Box>
      ),
      sortable: false,
      filterable: false,
      headerAlign: "center",

    },
    {
      field: "actions",
      headerName: "Hành động",
      renderCell: (params) => (
        <Box>
          {(hasPermission("UPDATE_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
            <IconButton
              onClick={() => handleClickOpenForm(params.row)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          }

          {(hasPermission("DELETE_INDUSTRIAL_PARK")) &&
            <IconButton
              onClick={() => handleDelete(params.row.code)}
              color="warning"
            >
              <DeleteIcon />
            </IconButton>
          }
        </Box>
      ),
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
    },
    {
      field: 'name',
      headerName: 'Tên',
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <Box>
          <Link to={`/industrial-park/${params.row.code}/${params.row.id}`} className="text-blue-500 cursor-pointer underline">
            {params.value}
          </Link>
        </Box>
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
      field: "code",
      headerName: "Mã",
      type: "string",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderHeader: (params) => (
        <Box className=" flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            value={code}
            onChange={(e) => handleSearchChange("code", e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      )

    },
    {
      field: "address",
      headerName: "Địa chỉ",
      flex: 1,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box className=" flex flex-col items-center justify-center leading-7 w-full">
          {/* Render custom header with search field below it */}
          <Box>{params.colDef.headerName}</Box>
          <TextField
            variant="standard"
            value={address}
            onChange={(e) => handleSearchChange("address", e.target.value)}
            placeholder="Tìm kiếm"
            size="small"
            fullWidth
          />
        </Box>
      ),
      headerAlign: "center",
    },
    {
      field: "userCode",
      headerName: "Người quản lý",
      flex: 1,
      headerAlign: "center",
      sortable: false,
      filterable: false,
    },
    {
      field: "square",
      headerName: "Diện tích",
      flex: 1,
      headerAlign: "center",
      
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1,
      headerAlign: "center",
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
    {
      field: "attrachment",
      headerName: "Tạo tour",
      renderCell: (params) => (
        <Box>
          {params.row.hasTour === false &&
            (hasPermission("CREATE_SCENE") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
            (<IconButton
              onClick={() => handleOpenAddVtour(params.row)}
              color="warning"
            >
              <Add />
            </IconButton>)
          }

        </Box>
      ),
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
    },
    // {
    //   field: "action1",
    //   headerName: "Chỉnh sửa bài viết",
    //   renderCell: (params) => (
    //     <Box>
    //       <IconButton
    //         onClick={() => handleOpenEdit(params.row)}
    //         color="warning"
    //       >
    //         <EditIcon />
    //       </IconButton>
    //     </Box>
    //   ),
    //   flex: 1,
    //   sortable: false,
    //   filterable: false,
    // }

  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Header
          title="Khu công nghiệp"
          subtitle="Quản lý khu công nghiệp"
        />
        <Box display="flex" gap="10px">
          {" "}
          {/* Thêm Box với gap để điều chỉnh khoảng cách */}
          {hasPermission("CREATE_INDUSTRIAL_PARK") &&
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={() => handleClickOpenForm(null)} // Mở form để tạo mới khi không có hàng được chọn
            >
              Thêm
            </Button>
          }

          {(hasPermission("DELETE_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleDeleteMultiple}
              disabled={selectedRows.length === 0}
            >
              Xóa
            </Button>
          }

          {(hasPermission("IMPORT_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleClickOpenImport} // Mở dialog Import
            >
              Thêm file
            </Button>
          }

          {(hasPermission("EXPORT_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: colors.blueAccent[700] }}
              onClick={handleExport}
            >
              Xuất file
            </Button>
          }
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
            <DataGrid
              checkboxSelection
              onSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection);
              }}
              rows={rows || []}
              columns={columns}
              getRowId={(row) => row.code}
              pagination
              loading={isLoading}
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
                noRowsLabel: "Không có dữ liệu",
              }}

              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 15, 20]}
              rowCount={totalItem}
              headerHeight={60}
              paginationMode="server"
            />
        
      </Box>

      {/* Dialog cho Form Create/Edit */}
      <Dialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        disableBackdropClick
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRow ? "Chỉnh sửa khu công nghiệp" : "Thêm khu công nghiệp"}
        </DialogTitle>
        <DialogContent>
          <Form rowData={selectedRow} formikRef={formikRef} refresh={() => fetchDataIndustrialPark(page, pageSize)} onCloseForm={handleCloseFormDialog} disableCancel={setDisableCancel} />{" "}
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


      <Dialog
        open={openImportDialog}
        onClose={handleCloseImportDialog}
        disableBackdropClick
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nhập file thêm khu công nghiệp</DialogTitle>
        <DialogContent>
          <ImportExcelDialog type={"industrial-park"} name={"khu công nghiệp"} onClose={handleCloseImportDialog} refresh={() => fetchDataIndustrialPark(page, pageSize)} />
        </DialogContent>
        {/* <DialogActions>
          <Button
            onClick={handleCloseImportDialog}
            color="primary"
            sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            disabled={disableCancel}
          >
            Hủy
          </Button>
        </DialogActions> */}
      </Dialog>

      {/* dialog for add vtour */}
      <Dialog
        open={openAddTourDialog}
        onClose={handleCloseAddVtour}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Thêm vtour trong khu công nghiệp
        </DialogTitle>
        <DialogContent>
          <AddVtourForm formikRef={formikRef} setIsLoading={setIsLoading} rowData={selectedRow} type="TOUR" refresh={() => fetchDataIndustrialPark(page, pageSize)} onCloseForm={handleCloseAddVtour} disableCancel={setDisableCancel} />
          {/* Truyền dữ liệu hàng đã chọn vào form */}
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => formikRef.current.submitForm()} color="secondary" variant="contained" loading={isLoading}>
            Thêm ảnh
          </LoadingButton>
          <Button
            onClick={handleCloseAddVtour}
            color="primary"
            sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
            disabled={disableCancel}
          >
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndustrialPark;
