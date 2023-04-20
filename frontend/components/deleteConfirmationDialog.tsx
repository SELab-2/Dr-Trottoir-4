import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Button } from "react-bootstrap";

export interface DeleteConfirmationDialogProps {
    open: boolean;
    title: string;
    description: string;
    handleClose: () => void;
    handleConfirm: () => void;
    confirmButtonText: string;
    cancelButtonText: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    title,
    description,
    handleClose,
    handleConfirm,
}) => (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
    >
        <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <DialogContentText id="confirmation-dialog-description">{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} variant="secondary">
                {"Annuleer"}
            </Button>
            <Button onClick={handleConfirm} variant="danger">
                {"Verwijder"}
            </Button>
        </DialogActions>
    </Dialog>
);

export default DeleteConfirmationDialog;
