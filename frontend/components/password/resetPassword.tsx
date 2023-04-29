import React, {FormEvent, useState} from "react";
import PasswordInput from "@/components/password/passwordInput";
import styles from "@/styles/Login.module.css";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const handlePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
    };

    const handlePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        // Handle the reset password process here
        console.log("Reset password");
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="d-flex align-items-center mb-3 pb-1">
                <i className="fas fa-cubes fa-2x me-3"/>
                <span className="h1 fw-bold mb-0">Reset Password.</span>
            </div>

            <PasswordInput
                value={newPassword}
                setPassword={setNewPassword}
                handlePasswordVisibility={handlePasswordVisibility1}
                showPassword={showPassword1}
                label="New Password"
                placeholder="New Password"
                showIconButton
            />

            <PasswordInput
                value={confirmPassword}
                setPassword={setConfirmPassword}
                handlePasswordVisibility={handlePasswordVisibility2}
                showPassword={showPassword2}
                label="Confirm Password"
                placeholder="Confirm Password"
                showIconButton
                customOnInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (newPassword !== e.target.value) {
                        e.target.setCustomValidity("Passwords do not match.");
                    } else {
                        e.target.setCustomValidity("");
                    }
                }}
                customOnInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (newPassword !== e.target.value) {
                        e.target.setCustomValidity("Passwords do not match.");
                    } else {
                        e.target.setCustomValidity("");
                    }
                }}
            />

            <div className="pt-1 mb-4">
                <button
                    className={`btn btn-dark btn-lg btn-block ${styles.button}`}
                    type="submit"
                >
                    Reset Password
                </button>
            </div>
        </form>
    );
}

export default ResetPassword;
