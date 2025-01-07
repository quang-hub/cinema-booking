import React, { useEffect, useState } from "react";
import { Modal, Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Axios from "../../components/Axios";
import VisibilityIcon from '@mui/icons-material/Visibility';

const UpdateBackUpDetailTable = ({ handleClose, selectedItem }) => {
  const token = localStorage.getItem("authToken") || "";

  const [listScene, setListScene] = useState([]);

  const handleClickOpenVr360 = (row) => {
    sessionStorage.setItem('tourData', row);
    const url = `/backupScene`;
    window.open(url, '_blank');
  }

  const fetchDataBackup = async () => {
    try {
      const url = `/vtour/get-scene-change-detail/${selectedItem}`;

      const response = await Axios.get(url, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });
      const responeData = response.data;
      console.log(responeData);


      setListScene(responeData.data);

    } catch (error) {
      console.error('Error fetching scenes:', error);

    }
  };

  useEffect(() => {
    fetchDataBackup();
  }, [])

  const tableData = [
    { id: 1, name: "Item 1", description: "This is item 1" },
    { id: 2, name: "Item 2", description: "This is item 2" },
    { id: 3, name: "Item 3", description: "This is item 3" },
  ];

  return (
    <div>
      {/* Popup Modal */}
      <Modal open={true} onClose={handleClose} aria-labelledby="popup-title" aria-describedby="popup-description" >
        <Box
          className="overflow-y-auto max-h-[80vh]"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: '60%',
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          {/* Header with Close Button */}
          <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        position: "sticky",
        top: 0,
        backgroundColor: "background.paper",
        zIndex: 10, // Ensure it appears above the rest of the content
        p: 2, // Optional padding for the sticky header
        borderBottom: "1px solid #ddd", // Optional: subtle border to distinguish the header
        height:'100%'
      }}
    >
      <Typography id="popup-title" variant="h6">
        Danh sách backups
      </Typography>
      <IconButton onClick={handleClose} aria-label="close">
        <CloseIcon />
      </IconButton>
    </Box>

          {/* Table Content */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh cũ</TableCell>
                <TableCell>Ảnh mới</TableCell>
                <TableCell>Xem bằng vr360</TableCell>
                <TableCell>Ngày chỉnh sửa</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {listScene.map((row) => (
                <TableRow key={row.oldSceneId}>
                  <TableCell>
                    <img
                      src={row.oldScene}
                      alt={"no image"}
                      style={{
                        maxHeight: "100px",
                        maxWidth: "100%",
                        border: "2px",  // Add a 2px solid border with light gray color
                        borderRadius: "8px"  // Optional: Add rounded corners
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={row.newScene}
                      alt={"no image"}
                      style={{
                        maxHeight: "100px",
                        maxWidth: "100%",
                        border: "2px",  // Add a 2px solid border with light gray color
                        borderRadius: "8px"  // Optional: Add rounded corners
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleClickOpenVr360(row.tourPath)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{(() => {
                    const formattedDate = new Date(row.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                    return <span>{formattedDate}</span>;
                  })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Modal>
    </div>
  );
};

export default UpdateBackUpDetailTable;
