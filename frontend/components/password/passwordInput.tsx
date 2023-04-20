import React from "react";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import styles from "@/styles/Login.module.css";

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
        <div className={`form-outline mb-4`}>
            <label className="form-label">{label}</label>
            <div style={{ position: "relative" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control form-control-lg ${styles.input}`}
                    value={value}
                    onInput={handleInput}
                    onInvalid={handleInvalid}
                    required
                    placeholder={placeholder}
                    style={{ paddingRight: "40px" }}
                />
                {showIconButton && (
                    <IconButton
                        onClick={handlePasswordVisibility}
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: "40px",
                            transform: "translateY(-50%)",
                        }}
                    >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                )}
            </div>
        </div>
    );
};

export default PasswordInput;
