import React, { useState } from 'react';
import {
    DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import Notification from '../../components/Notification';
import Axios from '../../components/Axios';


const UpdateDialog = ({ rowData, handleCloseUploadDialog, refresh }) => {
    let token = localStorage.getItem("authToken") || "";
    const [name, setName] = useState(rowData.name);
    // Xử lý file khi được thả hoặc chọn từ máy tính
    console.log('rowData', rowData);


    // Xử lý khi nhấn nút tải lên
    const handleUpload = async () => {
        await fetchUploadFile();
    };

    const fetchUploadFile = async () => {

        const data = {
            code: rowData.code,
            name: name
        };
        const apiEndpoint = "/attachment-file/edit";

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        await Axios.post(apiEndpoint, data, { headers })
            .then(response => {
                let responseData = response.data;
                console.log(responseData);
                if (responseData.code !== 200) {
                    Notification(responseData.message, "WARNING");
                    return;
                }
                Notification(responseData.message, "SUCCESS");
                refresh();
                handleCloseUploadDialog();
            })
            .catch(error => {
                // message = response.message;
                console.error('Error:', error);
                Notification(error.response?.data?.message, "ERROR");
            });
    }

    return (
        <>
            <DialogTitle>Chỉnh sửa mô tả</DialogTitle>

            <DialogContent>
                <TextField
                    label="Mô tả của file"
                    fullWidth
                    margin="normal"
                    required={true}
                    id="name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    inputProps={{maxLength:255}}

                />

            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleCloseUploadDialog}
                    color="primary"
                    sx={{
                        color: 'black',
                        backgroundColor: '#E8E8E8',
                        padding: 0,
                        paddingRight: 1,
                        '&:hover': {
                            backgroundColor: "#c2c2c2",
                            color: "#000000",
                        }
                    }}
                >
                    <IconButton>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    Hủy
                </Button>

                <Button
                    onClick={handleUpload}
                    color="primary"
                    sx={{
                        color: 'white',
                        backgroundColor: '#31AA54',
                        padding: 0,
                        paddingRight: 1,
                        '&:hover': {
                            backgroundColor: "#268240",
                            color: "#FFFFFF",
                        }
                    }}
                >
                    <IconButton sx={{ color: '#FFFFFF' }}>
                        <CheckIcon fontSize="small" />
                    </IconButton>
                    Chỉnh sửa
                </Button>
            </DialogActions>
        </>
    );
};

export default UpdateDialog;
