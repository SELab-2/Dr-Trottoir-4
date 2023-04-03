import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Button } from "react-bootstrap";

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  handleClose: () => void;
  handleConfirm: () => void;
  confirmButtonText: string;
  cancelButtonText: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  handleClose,
  handleConfirm,
  confirmButtonText,
  cancelButtonText,
}) => (
  <Dialog open={open} onClose={handleClose} aria-labelledby="confirmation-dialog-title" aria-describedby="confirmation-dialog-description">
    <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="confirmation-dialog-description">{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} variant="secondary">
        {cancelButtonText}
      </Button>
      <Button onClick={handleConfirm} variant="danger">
        {confirmButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
