import React from 'react';

interface ErrorMessageProps {
    formErrors: boolean;
    errorMessage: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ formErrors, errorMessage }) => {
    return formErrors ? (
        <div className="alert alert-danger" role="alert">
            {errorMessage}
        </div>
    ) : null;
};

export default ErrorMessage;