import React from "react";
import { Alert } from "react-bootstrap";

interface ErrorMessageProps {
    errorMessages: string[];
    setErrorMessages: (val: string[]) => void;
}

const ErrorMessageAlert: React.FC<ErrorMessageProps> = ({ errorMessages, setErrorMessages }) => {
    return (
        <>
            {errorMessages.length > 0 && (
                <Alert variant="danger" onClose={() => setErrorMessages([])} dismissible>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </Alert>
            )}
        </>
    );
};

export default ErrorMessageAlert;
