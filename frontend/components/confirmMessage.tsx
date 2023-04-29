import React from "react";
import {Alert} from "react-bootstrap";

interface ConfirmMessageProps {
    showConfirm: boolean;
    confirmMessage: string;
    onClose: (val: boolean) => void;
}

const ConfirmMessage: React.FC<ConfirmMessageProps> = ({ showConfirm, confirmMessage, onClose }) => {
    return showConfirm ? (
        <Alert variant="success" onClose={() => onClose(false)} dismissible>
            De informatie voor dit gebouw is opgeslagen!
        </Alert>
    ) : null;
};

export default ConfirmMessage;
