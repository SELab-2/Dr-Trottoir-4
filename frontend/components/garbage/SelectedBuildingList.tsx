import {BuildingInterface, getAddress} from "@/lib/building";
import {Button, Modal} from "react-bootstrap";
import React from "react";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";

export default function SelectedBuildingList(
    {
        show,
        closeModal,
        buildings,
        removeBuilding
    }: {
        show : boolean;
        closeModal : () => void
        buildings: BuildingInterface[];
        removeBuilding : (b : BuildingInterface) => void
    }) {
    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>Geselecteeerde gebouwen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                    <div className="form-outline mb-4">
                        {
                            buildings.length <= 0 &&
                            <h4 className="mb-4">Er zijn geen gebouwen geselecteerd</h4>
                    }
                    <ul>
                        {
                            buildings.map(b => <li key={b.id} value={b.id}>{getAddress(b)}
                                <Tooltip arrow placement="right" title="Verwijder">
                                <IconButton onClick={() => removeBuilding(b)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip></li>)
                        }
                    </ul>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" className="btn-dark" onClick={() => closeModal()}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
}