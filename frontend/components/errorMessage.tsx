import React from "react";
import { Alert } from 'react-bootstrap';

interface ErrorMessageProps {
    formErrors: boolean;
    errorMessage: string;
    onClose: (val: boolean) => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ formErrors, errorMessage, onClose }) => {
    return formErrors ? (
        <Alert variant="danger" onClose={() => onClose(false)} dismissible>
            {errorMessage}
        </Alert>
    ) : null;
};

export default ErrorMessage;
