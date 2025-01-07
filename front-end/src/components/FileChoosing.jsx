import { Button, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import FilePreview from "../components/FilePreview";
import Notification from "./Notification";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const FileChoosing = ({ setFieldValue, multiple, onFilesChange }) => { // Add onFilesChange prop
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (event) => {
        const files = event.target.files; // FileList from input
        const newPreviews = [];
        const newFilesArray = []; // Collect new File objects
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
    
            // Only process image files
            if (file.type.startsWith("image/")) {
                const fileUrl = URL.createObjectURL(file);
                newPreviews.push({ url: fileUrl, name: file.name, file });
                newFilesArray.push(file);
            }else{
                Notification("Không được thêm file khác ảnh","WARNING");
                break;
            }
        }
    
        // Combine old previews with new previews
        const updatedPreviews = multiple ? [...previews, ...newPreviews] : newPreviews;
        setPreviews(updatedPreviews);
    
        // Combine old files with new files for Formik
        const updatedFiles = multiple
            ? [...previews.map((p) => p.file), ...newFilesArray]
            : newFilesArray;
    
        // Call onFilesChange with the full updated file list
        onFilesChange(updatedFiles);
    
        // Update Formik field value with the updated file list
        setFieldValue("files", updatedFiles);
    };
    


    const handleRemovePreview = (indexToRemove) => {
        setPreviews((prev) => {
            // Lọc bỏ preview tại vị trí indexToRemove
            const newPreviews = prev.filter((_, index) => index !== indexToRemove);
            console.log(newPreviews);
            
            // Gọi callback với danh sách file được cập nhật
            onFilesChange(newPreviews.map(preview => preview.file));
            return newPreviews;
        });
    };
    
    useEffect(() => {
        // Cleanup function to revoke object URLs
        return () => {
            previews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    return (
        <>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                sx={{
                    backgroundColor: theme.palette.mode === "dark" ? colors.primary[300] : colors.primary[800],
                    color: theme.palette.mode === "dark" ? "white" : "black",
                    '&:hover': {
                        backgroundColor: colors.primary[700],
                    }
                }}
                startIcon={<CloudUploadIcon />}
            >
                Thêm file
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple={multiple}
                />
            </Button>

            {/* Display previews with file names */}
            <Box
                mt={2}
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'nowrap',
                }}
            >
                {previews.map((preview, index) => (
                    <FilePreview
                        key={index}
                        file={preview}
                        onRemove={() => handleRemovePreview(index)}
                    />
                ))}
            </Box>
        </>
    );
};

export default FileChoosing;
