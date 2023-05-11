import React from 'react';
import { FormControl, InputGroup, Button, Form } from 'react-bootstrap';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
                                                         showIconButton,
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
            <Form.Label id="normal_text">{label}</Form.Label>
            <InputGroup id="input">
                <FormControl
                    id="form_control"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onInput={handleInput}
                    onInvalid={handleInvalid}
                    required
                    placeholder={placeholder}
                />
                <Button
                        variant="light"
                        onClick={handlePasswordVisibility}
                    >
                        {showPassword ? <Visibility/> : <VisibilityOff/>}
                    </Button>
            </InputGroup>
        </div>
    );
};

export default PasswordInput;
