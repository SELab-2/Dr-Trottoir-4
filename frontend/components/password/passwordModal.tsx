import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import PasswordInput from "./passwordInput";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {changePassword} from "@/lib/authentication";
import {handleError} from "@/lib/error";

interface PasswordModalProps {
    show: boolean;
    closeModal: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({show, closeModal}) => {
    const [newPassword1, setNewPassword1] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);
    const [newPassword2, setNewPassword2] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const handleRepeatPasswordVisibility = () => {
        setShowRepeatPassword(!showRepeatPassword);
    };

    const handleSubmit = async () => {
        if (newPassword1 !== newPassword2) {
            setErrorMessages(["De ingevoerde wachtwoorden komen niet overeen."]);
            return;
        } else if (currentPassword == newPassword1 || currentPassword == newPassword2) {
            setErrorMessages(["Uw huidig wachtwoord en nieuw wachtwoord mogen niet overeenkomen"]);
        } else if (!newPassword1 || !currentPassword || !newPassword2) {
            setErrorMessages(["Gelieve alle velden in te vullen"]);
        } else {
            try {
                const res = await changePassword({
                    old_password: currentPassword,
                    new_password1: newPassword1,
                    new_password2: newPassword2,
                });
                closeModal();
            } catch (error: any) {
                setErrorMessages(handleError(error));
            }
        }
    };

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>Wijzig wachtwoord</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
                <PasswordInput
                    value={currentPassword}
                    setPassword={setCurrentPassword}
                    handlePasswordVisibility={handleCurrentPasswordVisibility}
                    showPassword={showCurrentPassword}
                    label="Huidig wachtwoord:"
                    placeholder="Voer uw huidige wachtwoord in"
                    showIconButton={true}
                />
                <PasswordInput
                    value={newPassword1}
                    setPassword={setNewPassword1}
                    handlePasswordVisibility={handlePasswordVisibility}
                    showPassword={showPassword}
                    label="Nieuw wachtwoord:"
                    placeholder="Voer uw nieuwe wachtwoord in"
                    showIconButton={true}
                />
                <PasswordInput
                    value={newPassword2}
                    setPassword={setNewPassword2}
                    handlePasswordVisibility={handleRepeatPasswordVisibility}
                    showPassword={showRepeatPassword}
                    label="Bevestig nieuw wachtwoord:"
                    placeholder="Voer uw nieuwe wachtwoord opnieuw in"
                    showIconButton={true}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-light" onClick={closeModal}>
                    Annuleer
                </Button>
                <Button variant="primary" className="btn-dark" onClick={handleSubmit}>
                    Opslaan
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PasswordModal;
