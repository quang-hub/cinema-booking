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
import { LoadingButton } from "@mui/lab";


const UploadDialog = ({ handleCloseUploadDialog, code, type, refresh, industrialParkCode }) => {
    let token = localStorage.getItem("authToken") || "";
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [name, setName] = useState();
    const [isLoading, setIsLoading] = useState(false);
    // Xử lý file khi được thả hoặc chọn từ máy tính
    const onDrop = (acceptedFiles) => {
        const MAX_FILE_SIZE_MB = 100; // Giới hạn dung lượng tệp (100MB)
        const filesWithStatus = acceptedFiles.map((file) => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                Notification(`File ${file.name} quá 100mb`, "WARNING");
                return {
                    file,
                    status: 'File quá lớn (>100MB)', // Đánh dấu trạng thái file lớn
                };
            }

            return {
                file,
                status: 'Sẵn sàng để thêm', // Trạng thái mặc định
            };
        });

        setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithStatus]);
    };


    // Dùng hook useDropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: '.pdf, .doc, .docx, .xlsx'
    });

    // Xử lý xóa file
    const handleDeleteFile = (fileIndex) => {
        setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
    };

    // Xử lý khi nhấn nút tải lên
    const handleUpload = async () => {
        setIsLoading(true);
        await fetchUploadFile(selectedFiles, code, type);
        setIsLoading(false);
    };

    const fetchUploadFile = async (selectedFiles, code, type) => {

        const formData = new FormData();
        // debugger
        // Thêm thông tin code và type vào formData dưới dạng một đối tượng JSON
        const data = {
            code: code,
            type: type,
            name: name
        };
        if (industrialParkCode !== undefined || industrialParkCode) {
            data["industrialParkCode"] = industrialParkCode;
        }
        console.log(data);

        formData.append('data', new Blob([JSON.stringify(data)], {
            type: 'application/json'
        }));

        // Thêm từng file vào formData
        Array.from(selectedFiles).forEach((file, index) => {
            formData.append('files', file.file);  // Tên 'files' cần khớp với cấu trúc yêu cầu API
        });

        const apiEndpoint = "/attachment-file/add";

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        };

        await Axios.post(apiEndpoint, formData, { headers })
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
            <DialogTitle>Tải tệp lên</DialogTitle>

            <DialogContent>
                <TextField
                    label={
                        <span>
                            Mô tả<span style={{ color: 'red' }}>(*)</span>
                        </span>
                      }
                    fullWidth
                    margin="normal"
                    required={true}
                    id="name"
                    value={name}
                    inputProps={{maxLength:255}}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <Typography variant="body2" color="textSecondary">
                    <span style={{ color: 'black' }}>Tệp đính kèm:</span> (dung lượng tối đa là 500MB)
                </Typography>

                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed #d1d1d1',
                        borderRadius: '10px',
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: isDragActive ? '#e6f7ff' : '#FFFFFF',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    <input {...getInputProps()} />
                    <UploadFileIcon sx={{ fontSize: 50, color: '#066BF9' }} />
                    <Typography variant="body1" sx={{ color: '#066BF9' }}>
                        <strong>{isDragActive ? 'Thả tập tin vào đây...' : 'Tải lên hoặc kéo tập tin của bạn vào đây'}</strong>
                    </Typography>
                </Box>

                {/* Danh sách file đã chọn */}
                {selectedFiles.length > 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên file</TableCell>
                                    <TableCell>Kích thước</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedFiles.map((fileData, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{fileData.file.name}</TableCell>
                                        <TableCell>
                                            {(fileData.file.size / 1024 / 1024) >= 1
                                                ? (fileData.file.size / 1024 / 1024).toFixed(2) + " MB"
                                                : (fileData.file.size / 1024).toFixed(2) + " KB"}
                                        </TableCell>
                                        <TableCell>{fileData.status}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeleteFile(index)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions>
            <LoadingButton
                    onClick={handleUpload}
                    color="primary"
                    loading={isLoading}
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
                    Tải lên
                </LoadingButton>
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

               
            </DialogActions>
        </>
    );
};

export default UploadDialog;
