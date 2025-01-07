// AlertDialog component
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const AlertDialog = ({ open, message, onClose }) => {
  const handleClose = (confirmed) => {
    onClose(confirmed); // Trả về true nếu người dùng xác nhận, false nếu không
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Xác nhận xoá"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message || "Bạn có chắc chắn muốn xoá người dùng này không?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="secondary">
          Hủy bỏ
        </Button>
        <Button onClick={() => handleClose(true)} color="error" autoFocus>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
