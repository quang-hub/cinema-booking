import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    IconButton,TextField
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import InfoIcon from '@mui/icons-material/Info';
import HistoryTableDialog from "./HistoryTableDialog";

const ManageHistory = ({ type, id }) => {
    const token = localStorage.getItem("authToken") || "";

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [selectedRow, setSelectedRow] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
    const [rows, setRows] = useState([]); // Lưu trữ danh sách Industrial Parks

    const [page, setPage] = useState(0);

    const [pageSize, setPageSize] = useState(10);
    const [totalItem, setTotalItem] = useState(0);
    const [userCode, setUserCode] = useState("");
    const [action, setAction] = useState("");
    const [objectName, setObjectName] = useState("");

    const [openDetailDialog, setOpenDetailDialog] = useState();

    const handleSearchChange = (type, searchterm) => {
        if (type === "userCode") {
            setUserCode(searchterm);
            fetchDataHistory(page, pageSize,searchterm,action,objectName);
        }
        if (type === "action") {
            setAction(searchterm);
            fetchDataHistory(page, pageSize, userCode,searchterm,objectName);
        }
        if (type === "objectName") {
            setObjectName(searchterm);
            fetchDataHistory(page, pageSize,userCode,action, searchterm);
            console.log(searchterm);
            
        }
      };

    const handleOpenDetailDialog = async (rowData = null) => {
        await findHistoryById(rowData);
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
        setSelectedRow(null); // Reset lại sau khi đóng form
    };


    useEffect(() => {
        fetchDataHistory(page, pageSize);
    }, [page, pageSize]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(0); // Reset page to 1 when page size changes
    };

    const findHistoryById = async (id) => {
        try {

            const url = `/history-detail/${id}/detail`;

            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            let responeData = response.data;
            setSelectedRow(responeData.data);
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    }

    const fetchDataHistory = async (page, size,userCode,action,objectName) => {
        try {
            const url = `/history/search`;


            const postData = {
                pageSize: size,
                pageIndex: page + 1,
            };
            if(userCode && userCode.length!==0){
                postData["createdBy"] = userCode;
            }
            if(action && action.length!==0){
                postData["status"] = action;
            }
            
            if (type !== null) {
                postData["objectName"] = type;
                postData["objectId"] = id;
            }else if(objectName && objectName.length !==0 ){
                postData["objectName"] = objectName;
            }
            const response = await Axios.post(url, postData, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            let responeData = response.data;
            console.log(responeData);

            if (responeData.code !== 200) {
                return;
            }
            setRows(responeData.data.content);
            setTotalItem(responeData.data.totalPages || 0);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };



    const columns = [
        {
            field: "actions",
            headerName: "Xem thêm",
            renderCell: (params) => (
                <Box>
                    {params.row.status === "UPDATE" && (
                        <IconButton
                            onClick={() => handleOpenDetailDialog(params.row.id)}
                            color="secondary"
                        >
                            <InfoIcon />
                        </IconButton>
                    )}
                </Box>
            ),
            flex: 1,
            sortable: false,
            filterable: false,
        },
        {
            field: "createdBy",
            headerName: "Người thực hiện",
            flex: 1,
            renderHeader: (params) => (
                <Box className=" flex flex-col items-center justify-center leading-7 w-full">
                  {/* Render custom header with search field below it */}
                  <Box>{params.colDef.headerName}</Box>
                  <TextField
                    variant="standard"
                    value={userCode}
                    onChange={(e) => handleSearchChange("userCode", e.target.value)}
                    placeholder="Tìm kiếm"
                    size="small"
                    fullWidth
                  />
                </Box>
              ),
              sortable: false,
            filterable: false,
        },
        { field: "status", headerName: "Hành động", flex: 1,
            sortable: false,
            filterable: false,
            renderHeader: (params) => (
                <Box className=" flex flex-col items-center justify-center leading-7 w-full">
                  {/* Render custom header with search field below it */}
                  <Box>{params.colDef.headerName}</Box>
                  <TextField
                    variant="standard"
                    value={action}
                    onChange={(e) => handleSearchChange("action", e.target.value)}
                    placeholder="Tìm kiếm"
                    size="small"
                    fullWidth
                  />
                </Box>
              )

        },

        {
            field: "createdAt",
            headerName: "Ngày tạo",
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
        {
            field: "objectName",
            headerName: "Đối tượng",
            flex: 1,
            renderHeader: (params) => (
                <Box className=" flex flex-col items-center justify-center leading-7 w-full">
                  {/* Render custom header with search field below it */}
                  <Box>{params.colDef.headerName}</Box>
                  <TextField
                    variant="standard"
                    value={objectName}
                    onChange={(e) => handleSearchChange("objectName", e.target.value)}
                    placeholder="Tìm kiếm"
                    size="small"
                    fullWidth
                  />
                </Box>
              )
        }
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
                    title="Lịch sử"
                    subtitle="Xem lịch sử chỉnh sửa"
                />

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
                    rows={rows || []}
                    columns={columns}
                    getRowId={(row) => row.id}
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
                        noRowsLabel: "Không có dữ liệu",
                    }}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    rowsPerPageOptions={[10, 15, 20]}
                    rowCount={totalItem * pageSize}
                    paginationMode="server"
                />

            </Box>




            <Dialog
                open={openDetailDialog}
                onClose={handleCloseDetailDialog}
                maxWidth="md"
                fullWidth={false}

            >
                <DialogTitle>Thông tin chi tiết</DialogTitle>
                <DialogContent>
                    <HistoryTableDialog selectedRow={selectedRow} />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDetailDialog}
                        color="primary"
                        sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
                    >
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageHistory;
