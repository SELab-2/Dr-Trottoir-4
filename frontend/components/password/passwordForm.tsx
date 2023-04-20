import React from 'react';
import PasswordInput from "./passwordInput";

const PasswordForm = () => {
    const [password1, setPassword1] = React.useState("");
    const [password2, setPassword2] = React.useState("");
    const [showPassword1, setShowPassword1] = React.useState(false);
    const [showPassword2, setShowPassword2] = React.useState(false);

    const handlePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
    };

    const handlePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
    };

    return (
        <>
            <PasswordInput
                value={password1}
                setPassword={setPassword1}
                handlePasswordVisibility={handlePasswordVisibility1}
                showPassword={showPassword1}
                label="Wachtwoord:"
                placeholder="Wachtwoord"
            />

            <PasswordInput
                value={password2}
                setPassword={setPassword2}
                handlePasswordVisibility={handlePasswordVisibility2}
                showPassword={showPassword2}
                label="Bevestig wachtwoord:"
                placeholder="Wachtwoord"
            />
        </>
    );
};

export default PasswordForm;
