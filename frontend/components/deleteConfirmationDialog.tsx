import React from "react";
import ConfirmationDialog, {ConfirmationDialogProps} from "@/components/confirmationDialog";

const DeleteConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  handleClose,
  handleConfirm,
}) => (
      <ConfirmationDialog
    open={open}
    title={title}
    description={description}
    handleClose={handleClose}
    handleConfirm={handleConfirm}
    confirmButtonText="Verwijderen"
    cancelButtonText="Annuleren"
      />
);

export default DeleteConfirmationDialog;