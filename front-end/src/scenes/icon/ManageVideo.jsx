import React, { useEffect, useState } from "react";
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
import AddIconForm from "./AddIconForm"; // Ensure this import is correct
import Axios from "../../components/Axios";
import { useNavigate } from 'react-router-dom';

import Loader from "../../components/Loading";
import Notification from "../../components/Notification";
import DeleteIcon from "@mui/icons-material/Delete";
import { hasPermission } from "../login/DecodeToken";

import showAlertDialog from "../../components/ShowAlertDialog";

const ManageVideo = () => {
    let token = localStorage.getItem("authToken") || "";
    const navigate = useNavigate();

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItem, setTotalItem] = useState(0);
    const [name, setName] = useState("");

    const handleClickOpenForm = (rowData = null) => {
        setSelectedRow(rowData);
        setOpenFormDialog(true);
    };

    const handleSearchChange= async(searchterm)=>{
        setName(searchterm);
        // setIsLoading(true);
        await fetchData(page,pageSize,searchterm);
        // setIsLoading(false);
        
    }
    const handleCloseFormDialog = () => {
        setOpenFormDialog(false);
        setSelectedRow(null);
    };

    const DeleteIcon1 = async (id) => {
        try {
            const requestData = {};
            const response = await Axios.post(`/hotspot-resource/delete/${id}`, requestData, {
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
            const updatedRows = rows.filter((row) => row.id !== id);
            setRows(updatedRows);
        } catch (error) {
            console.error('Error deleting icon:', error);
            Notification(error.response?.data?.message, "WARNING");
        }
    };

    const fetchData = async (page,pageSize,name) => {
        try {
            const apiEndpoint = `/hotspot-resource/search?type=VIDEO&page=${page + 1}&size=${pageSize}${name ? `&name=${name}`:""}`;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const response = await Axios.get(apiEndpoint, { headers });
            const responseData = response.data.data;

            setRows(responseData.data || []);
            setTotalItem(responseData.totalElements || 0);
        } catch (error) {
            console.error('Error fetching icons:', error);
        }
    };

    useEffect(() => {
        const fetchData1 = async () => {
            setIsLoading(true);
            await fetchData(page, pageSize);
            setIsLoading(false);
          };
      
          fetchData1();
    }, [page,pageSize]);

    const handleDelete = async (id) => {
        const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn xóa video này?");
        if (!confirmDelete) return;

        setIsLoading(true);
        await DeleteIcon1(id);
        setIsLoading(false);
    };

    const handlePageChange = async (newPage) => {
        setPage(newPage);

    };

    const handlePageSizeChange = async (newPageSize) => {
        setPageSize(newPageSize);
        setPage(0);
    };

    const columns = [
        {
            field: "name",
            headerName: "Tên",
            type: "string",
            headerAlign: "left",
            align: "left",
            sortable:false,
            renderHeader: (params) => (
                <Box className=" flex flex-col items-center justify-center leading-7 w-full">
                  {/* Render custom header with search field below it */}
                  <Box>{params.colDef.headerName}</Box>
                  <TextField
                    variant="standard"
                    value={name}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm kiếm"
                    size="small"
                    fullWidth
                  />
                </Box>
              )
        },
        {
            field: "path",
            headerName: "Ảnh",
            flex: 1,
            renderCell: (params) => (
                <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {params.value ? (

                        <Box
                            component="video"
                            src={params.value}
                            controls
                            autoPlay={false}
                            sx={{
                                maxHeight: "80%",
                                maxWidth: "80%",
                                border: "2px",
                                borderRadius: "8px"
                            }}
                        />
                    ) : (
                        <span>Không có ảnh</span>
                    )}
                </div>
            ),
            sortable: false,
            filterable: false,
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
            field: "actions",
            headerName: "Hành động",
            renderCell: (params) => (
                <Box>
                    {(hasPermission("DELETE_HOTSPOT_RESOURCE") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
                        <IconButton onClick={() => handleDelete(params.row.id)} color="warning">
                            <DeleteIcon />
                        </IconButton>
                    }
                </Box>
            ),
            flex: 1,
            sortable: false,
            filterable: false,
        }
    ];

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
                <Header title="Video" subtitle="Quản lý Video" />
                {(hasPermission("CREATE_HOTSPOT_RESOURCE") || hasPermission("MANAGE_INDUSTRIAL_PARK")) &&
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ backgroundColor: colors.blueAccent[700] }}
                        onClick={() => handleClickOpenForm(null)}
                    >
                        Thêm
                    </Button>
                }
            </Box>
            <Box
                height="73vh"
                sx={{
                    overflow: "auto",
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "none" },
                    "& .name-column--cell": { color: colors.greenAccent[300] },
                    "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
                    "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
                    "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
                    "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
                }}
            >
                {!isLoading ? (
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
                        rowCount={totalItem}
                        paginationMode="server"
                        rowHeight={200}
                    />
                ) : (
                    <Loader />
                )}
            </Box>

            <Dialog
                open={openFormDialog}
                onClose={handleCloseFormDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Thêm Video</DialogTitle>
                <DialogContent>
                    <AddIconForm type={"VIDEO"} refresh={()=>fetchData(page,pageSize)} onCloseForm={handleCloseFormDialog} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFormDialog} color="primary">
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageVideo;
