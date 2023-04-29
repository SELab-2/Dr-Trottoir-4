import React from "react";
import {Button, Modal} from "react-bootstrap";
import styles from "@/styles/Login.module.css";

export enum ModalMode {
    ADD = "ADD",
    EDIT = "EDIT",
}

interface RegionModalProps {
    show: boolean;
    closeModal: () => void;
    onSubmit: (regionName: string) => void;
    mode: ModalMode;
    regionName: string;
    setRegionName: (name: string) => void;
}

const RegionModal: React.FC<RegionModalProps> = ({ show, closeModal, onSubmit, mode, regionName, setRegionName }) => {
    // const [regionName, setRegionName] = useState(initialRegionName);

    const handleSubmit = () => {
        onSubmit(regionName);
        closeModal();
    };

    const title = mode === ModalMode.ADD ? "Maak nieuwe regio" : "Wijzig regio";

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-outline mb-4">
                    <label className="form-label">Regio naam</label>
                    <input
                        type="text"
                        className={`form-control form-control-lg ${styles.input}`}
                        id="name"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        autoFocus
                    />
                </div>
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

export default RegionModal;
