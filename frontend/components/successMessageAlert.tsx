import React from "react";
import { Alert } from "react-bootstrap";

interface SuccessMessageProps {
    successmessages: string[];
    setSuccessMessages: (val: string[]) => void;
}

const SuccessMessageAlert: React.FC<SuccessMessageProps> = ({ successmessages, setSuccessMessages }) => {
    return (
        <>
            {successmessages.length > 0 && (
                <Alert variant="success" onClose={() => setSuccessMessages([])} dismissible>
                    <ul>
                        {successmessages.map((suc, i) => (
                            <li key={i}>{suc}</li>
                        ))}
                    </ul>
                </Alert>
            )}
        </>
    );
};

export default SuccessMessageAlert;
