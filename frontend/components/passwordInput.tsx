import React from 'react';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import styles from "@/styles/Login.module.css";

interface PasswordInputProps {
    value: string;
    setPassword: (pw: string) => void;
    handlePasswordVisibility: () => void;
    showPassword: boolean;
    label: string;
    placeholder: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
                                                         value,
                                                         setPassword,
                                                         handlePasswordVisibility,
                                                         showPassword,
                                                         label,
                                                         placeholder,
                                                     }) => {
    return (
        <div className={`form-outline mb-4`}>
            <label className="form-label">{label}</label>
            <div style={{position: 'relative'}}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg ${styles.input}`}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPassword(e.target.value);
                        e.target.setCustomValidity("");
                    }}
                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.target.setCustomValidity("Wachtwoord is verplicht.");
                    }}
                    required
                    placeholder={placeholder}
                    style={{paddingRight: '40px'}}
                />
                <IconButton
                    onClick={handlePasswordVisibility}
                    edge="end"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        transform: 'translateY(-50%)',
                    }}
                >
                    {showPassword ? <Visibility/> : <VisibilityOff/>}
                </IconButton>
            </div>
        </div>
    );
};

export default PasswordInput;
