import React from "react";
import { Button, Form, FormControl, InputGroup } from "react-bootstrap";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface PasswordInputProps {
    value: string;
    setPassword: (pw: string) => void;
    handlePasswordVisibility: () => void;
    showPassword: boolean;
    label: string;
    placeholder: string;
    showIconButton: boolean;
    customOnInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customOnInvalid?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    setPassword,
    handlePasswordVisibility,
    showPassword,
    label,
    placeholder,
    customOnInput,
    customOnInvalid,
}) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (customOnInput) {
            customOnInput(e);
        }
    };

    const handleInvalid = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (customOnInvalid) {
            customOnInvalid(e);
        } else {
            e.target.setCustomValidity("Wachtwoord is verplicht.");
        }
    };

    return (
        <div>
            <Form.Label htmlFor={"password"} className="normal_text">
                {label}
            </Form.Label>
            <InputGroup className="input">
                <FormControl
                    className="form_control"
                    id={"password"}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={handleInput}
                    onInvalid={handleInvalid}
                    required
                    placeholder={placeholder}
                />
                <Button variant="light" onClick={handlePasswordVisibility}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
            </InputGroup>
        </div>
    );
};

export default PasswordInput;
