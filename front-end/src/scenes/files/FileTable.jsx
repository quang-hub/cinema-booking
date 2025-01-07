import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/CloudUpload';
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import UploadDialog from "./UploadDialog";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import EditIcon from "@mui/icons-material/Edit";
import { hasPermission } from "../login/DecodeToken";
import showAlertDialog from "../../components/ShowAlertDialog";
import UpdateDialog from "./UpdateDialog";


const FileTable = ({ type, code, industrialParkCode }) => {
    const token = localStorage.getItem("authToken") || "";
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [rows, setRows] = useState([]);
    const [rowData, setRowData] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState();
    const [openUpdateDialog, setOpenUpdateDialog] = useState();

    const handleDownloadAllClick = async () => {
        await rows.forEach((row) => {
            window.open(row.path, "_blank"); // This will open each file in a new tab/window for download
        });
    }

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    }

    const handleEdit = (rowData) => {
        setRowData(rowData);
        setOpenUpdateDialog(true);
    }

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    }

    const handleDownloadClick = (rowData) => {
        window.open(rowData, "_blank");
    }

    const handleDelete = async (rowData) => {
        const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn xóa file này?");
        if (!confirmDelete) return;

        await deleteFileUpload(rowData);
    }

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
    }

    const deleteFileUpload = async (rowData) => {
        try {
            const url = `/attachment-file/delete/${rowData}`;
            const response = await Axios.post(url, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            let responeData = response.data;

            if (responeData.code !== 200) {
                Notification(responeData.message, "WARNING");
                return;
            }
            Notification(responeData.message, "SUCCESS");
            setRows(rows.filter(s => s.code !== rowData));

        } catch (error) {
            console.error('Error fetching scenes:', error);
            Notification(error.response?.data?.message, "WARNING");
        }
    }

    const fetchDataFiles = async () => {
        try {
            const url = `/attachment-file/get-all?type=${type}&code=${code}` + (industrialParkCode !== undefined ? `&industrialParkCode=${industrialParkCode}` : "");
            console.log(url);

            const response = await Axios.get(url, {
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
            setRows(responeData.data);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    }
    useEffect(() => {
        fetchDataFiles();
    }, []);

    const columns = [
        {
            field: "name",
            headerName: "Mô tả",
            flex: 1,
        },
        {
            field: "fileName",
            headerName: "Tên file",
            flex: 2,
        },
        {
            field: "extension",
            headerName: "Kiểu file",
            flex: 0.5,
            renderCell: (params) => {
                // Fallback colors in case colors object is undefined
                let backgroundColor = '#CCCCCC'; // Default grey

                if (colors) {
                    switch (params.value) {
                        case 'docx':
                            backgroundColor = colors.blueAccent ? colors.blueAccent[600] : '#5DE2E7'; // Blue
                            break;
                        case 'pdf':
                            backgroundColor = colors.orangeAccent ? colors.orangeAccent[400] : '#FF9800'; // Orange
                            break;
                        case 'xlsx':
                            backgroundColor = colors.greenAccent ? colors.greenAccent[400] : '#7DDA58'; // Green

                            break;
                        default:
                            backgroundColor = colors.greyAccent ? colors.greyAccent[400] : '#9E9E9E'; // Grey
                            break;
                    }
                }

                return (
                    <Box
                        sx={{
                            backgroundColor,
                            color: theme.palette.mode === "dark" ? "white" : "black",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            textAlign: "center",
                            minWidth: "50px"
                        }}
                    >
                        {params.value}
                    </Box>
                );
            },
        },
        {
            field: "size",
            headerName: "Kích thước",
            flex: 0.5,
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            renderCell: (params) => (
                <Box display="flex" gap="10px">
                    <IconButton onClick={() => handleDownloadClick(params.row.path)}>
                        <DownloadIcon />
                    </IconButton>

                    {hasPermission("UPLOAD_ATTACHMENT_FILE") &&
                        <IconButton onClick={() => handleEdit(params.row)} color="secondary">
                            <EditIcon />
                        </IconButton>
                    }

                    {hasPermission("DELETE_ATTACHMENT_FILE") &&
                        <IconButton onClick={() => handleDelete(params.row.code)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    }
                </Box>
            ),
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
                <Header
                    title="File"
                    subtitle="Quản lý file"
                />
                <Box display="flex" gap="10px">
                    {hasPermission("UPLOAD_ATTACHMENT_FILE") &&
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<UploadIcon />}
                            sx={{ backgroundColor: colors.blueAccent[700] }}
                            onClick={() => handleOpenUploadDialog()} // Mở form để tạo mới khi không có hàng được chọn
                        >
                            Thêm file
                        </Button>
                    }
                    {rows.length !== 0 &&
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadAllClick}
                            sx={{ backgroundColor: colors.blueAccent[700] }}
                        >
                            Tải xuống tất cả
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
                    rows={rows || []}
                    columns={columns}
                    getRowId={(row) => row.path}
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

                />

            </Box>
            <Dialog
                open={openUploadDialog}
                maxWidth="md"
                fullWidth
            >
                <UploadDialog handleCloseUploadDialog={handleCloseUploadDialog} industrialParkCode={industrialParkCode} code={code} type={type} refresh={fetchDataFiles} />
            </Dialog>

            <Dialog
                open={openUpdateDialog}
                maxWidth="md"
                fullWidth
            >
                <UpdateDialog rowData={rowData} handleCloseUploadDialog={handleCloseUpdateDialog} refresh={fetchDataFiles} />
            </Dialog>
        </Box>
    );
};

export default FileTable;
