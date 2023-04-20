import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import PasswordInput from "./passwordInput";
import ErrorMessage from "@/components/errorMessage";

interface PasswordModalProps {
    show: boolean;
    closeModal: () => void;
    onSubmit: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({show, closeModal, onSubmit}) => {
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [formErrors, setFormErrors] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");


    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };


    const handleSubmit = () => {
        if (currentPassword !== "yourCurrentPassword") {
            setFormErrors(true);
            setErrorMessage("Huidig wachtwoord is onjuist.");
            return;
        } else if (password !== confirmPassword) {
            setFormErrors(true);
            setErrorMessage("De ingevoerde wachtwoorden komen niet overeen.");
            return;
        } else if (!password || !currentPassword || !confirmPassword) {
            setFormErrors(true);
            setErrorMessage("Gelieve alle velden in te vullen");
        } else {
            onSubmit(password);
            closeModal();
        }
    };


    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>Wijzig wachtwoord</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorMessage formErrors={formErrors} errorMessage={errorMessage} onClose={setFormErrors}/>
                <PasswordInput
                    value={currentPassword}
                    setPassword={setCurrentPassword}
                    handlePasswordVisibility={handleCurrentPasswordVisibility}
                    showPassword={showCurrentPassword}
                    label="Huidig wachtwoord:"
                    placeholder="Voer uw huidige wachtwoord in"
                    showIconButton={true}/>
                <PasswordInput
                    value={password}
                    setPassword={setPassword}
                    handlePasswordVisibility={handlePasswordVisibility}
                    showPassword={showPassword}
                    label="Nieuw wachtwoord:"
                    placeholder="Voer uw nieuwe wachtwoord in"
                    showIconButton={true}/>
                <PasswordInput
                    value={confirmPassword}
                    setPassword={setConfirmPassword}
                    handlePasswordVisibility={() => null}
                    showPassword={false}
                    label="Bevestig nieuw wachtwoord:"
                    placeholder="Voer uw nieuwe wachtwoord opnieuw in"
                    showIconButton={false}/>
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
