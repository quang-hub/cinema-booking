import React, { useEffect, useState } from "react";
import {
    Box,
    useTheme,
    IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Axios from "../../components/Axios";


const BackupTable = ({ code }) => {
    const token = localStorage.getItem("authToken") || "";

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [rows, setRows] = useState([]); // Lưu trữ danh sách Industrial Parks

    const [page, setPage] = useState(0);

    const [pageSize, setPageSize] = useState(10);
    const [totalItem, setTotalItem] = useState(0);

    const handleClickOpenVr360 = (row) => {
        sessionStorage.setItem('tourData', row);
        const url = `/backupScene`;
        window.open(url, '_blank');
    }

    useEffect(() => {
        fetchDataBackup(page, pageSize);
    }, [page, pageSize]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(0); // Reset page to 1 when page size changes
    };


    const fetchDataBackup = async (page, pageSize) => {
        try {
            const url = `/vtour/get-all-deleted-tour`;
            const requestData = {
                    industrialParkCode: code,
                    page: page+1,
                    size: pageSize,
            }
            const response = await Axios.post(url, requestData,{
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            const responeData = response.data.data;

            setRows(responeData.data);
            setTotalItem(responeData.totalElements);

        } catch (error) {
            console.error('Error fetching scenes:', error);

        }
    };

    const columns = [
        // {
        //     field: "oldScene",
        //     headerName: "Ảnh cũ",
        //     flex: 1,
        //     renderCell: (params) => (
        //         <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>  {/* Centering the image */}
        //             {params.value ? (  // Check if thumbUrl exists before rendering image
        //                 <img
        //                     src={params.value}
        //                     alt={"no image"}
        //                     style={{
        //                         maxHeight: "100px",
        //                         maxWidth: "100%",
        //                         border: "2px",  // Add a 2px solid border with light gray color
        //                         borderRadius: "8px"  // Optional: Add rounded corners
        //                     }}
        //                 />
        //             ) : (
        //                 <span>No Image Available</span>  // Display a message if no thumbUrl is provided
        //             )}
        //         </div>
        //     ),
        //     sortable: false,
        //     filterable: false,
        // },
        // {
        //     field: "newScene",
        //     headerName: "Ảnh mới",
        //     flex: 1,
        //     renderCell: (params) => (
        //         <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>  {/* Centering the image */}
        //             {params.value ? (  // Check if thumbUrl exists before rendering image
        //                 <img
        //                     src={params.value}
        //                     alt={"no image"}
        //                     style={{
        //                         maxHeight: "100px",
        //                         maxWidth: "100%",
        //                         border: "2px",  // Add a 2px solid border with light gray color
        //                         borderRadius: "8px"  // Optional: Add rounded corners
        //                     }}
        //                 />
        //             ) : (
        //                 <span>No Image Available</span>  // Display a message if no thumbUrl is provided
        //             )}
        //         </div>
        //     ),
        //     sortable: false,
        //     filterable: false,
        // },
        {
            field: "tourPath",
            headerName: "Xem bằng vr360",
            renderCell: (params) => (
                <Box>

                    < IconButton
                        onClick={() => handleClickOpenVr360(params.row.tourPath)}
                        color="secondary"
                    >
                        <VisibilityIcon />
                    </IconButton >
                </Box >
            ),
            flex: 1,
            sortable: false,
            filterable: false,
        },
        {
            field: "createdAt",
            headerName: "Ngày lưu",
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
                    title="Bản lưu backup"
                    subtitle="Quản lý bản lưu backup"
                />
                <Box display="flex" gap="10px">

                </Box>
            </Box>
            <Box
                height="100vh"
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
                    getRowId={(row) => row.createdAt}
                    pagination
                    page={page}
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
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    rowsPerPageOptions={[10, 15, 20]}
                    rowCount={totalItem}
                    paginationMode="server"
                    rowHeight={130}
                />

            </Box>

        </Box>
    );
};

export default BackupTable;
