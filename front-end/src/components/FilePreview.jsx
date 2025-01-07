import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const FilePreview = ({ file, onRemove }) => {
    return (
        <Box sx={{ position: 'relative', width: 140, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', width: 130, height: 130, overflow: 'hidden' }}>
                <img
                    src={file.url}
                    alt={file.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Remove icon */}
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.8)' },
                        zIndex: 1
                    }}
                    onClick={onRemove}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
            {/* Display file name */}
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {file.name}
            </Typography>
        </Box>
    );
};

export default FilePreview;