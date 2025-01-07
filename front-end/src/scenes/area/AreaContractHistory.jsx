import React, { useEffect, useState } from "react";
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
import Axios from "../../components/Axios";
import InfoIcon from '@mui/icons-material/Info';
import HistoryTableDialog from "../history/HistoryTableDialog";

const AreaContractHistory = ({ type, id }) => {
    const token = localStorage.getItem("authToken") || "";

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [selectedRow, setSelectedRow] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
    const [rows, setRows] = useState([]); // Lưu trữ danh sách Industrial Parks

    const [page, setPage] = useState(0);

    const [pageSize, setPageSize] = useState(10);
    const [totalItem, setTotalItem] = useState(0);

    const [openDetailDialog, setOpenDetailDialog] = useState();


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

    const fetchDataHistory = async (page, size) => {
        try {
            const url = `/history/search`;

            const postData = {
                pageSize: size,
                pageIndex: page + 1
            };
            if (type !== null) {
                postData["objectName"] = type;
                postData["objectId"] = id;
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
            field: "createdBy",
            headerName: "Người thực hiện",
            flex: 1,
        },
        { field: "status", headerName: "hành động", flex: 1, },

        {
            field: "createdAt",
            headerName: "Ngày thực hiện",
            flex: 1,
        },
        {
            field: "objectName",
            headerName: "Object",
            flex: 1,
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
                    title="Hợp đồng"
                    subtitle="Xem hợp đồng thuê của khu đất"
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

export default AreaContractHistory;
