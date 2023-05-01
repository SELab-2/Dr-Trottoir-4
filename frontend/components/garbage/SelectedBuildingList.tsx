import {BuildingInterface, getAddress} from "@/lib/building";
import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {getAllTours, Tour} from "@/lib/tour";

export default function SelectedBuildingList(
    {
        show,
        closeModal,
        buildings,
        selectedTours,
        removeBuilding,
        removeTour,
        removeAllBuildings
    }: {
        show: boolean;
        closeModal: () => void
        buildings: BuildingInterface[];
        selectedTours: { [tourId: number]: BuildingInterface[] }
        removeBuilding: (b: BuildingInterface) => void
        removeTour : (t : number) => void,
        removeAllBuildings : () => void
    }) {

    const [allTours, setAllTours] = useState<Tour[]>([]);

    useEffect(() => {
        getAllTours().then(res => {
            const data: Tour[] = res.data;
            setAllTours(data);
        }, console.error);
    }, []);

    function getTourName(tourId : number) {
        const tour : Tour | undefined = allTours.find(t => t.id === tourId);
        if (! tour) {
            return "";
        }
        return tour.name;
    }

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>Geselecteeerde gebouwen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-outline mb-4">
                    <label className="mb-4 h4">Gebouwen:</label>
                    {
                        buildings.length <= 0 &&
                        <h6 className="mb-4">Er zijn geen gebouwen geselecteerd</h6>
                    }
                    <ul>
                        {
                            buildings.map(b => <li key={b.id} value={b.id}>{getAddress(b)}
                                <Tooltip arrow placement="right" title="Verwijder">
                                    <IconButton onClick={() => removeBuilding(b)}>
                                        <Delete/>
                                    </IconButton>
                                </Tooltip></li>)
                        }
                    </ul>
                </div>
                <div className="form-outline mb-4">
                    <label className="mb-4 h4">Rondes:</label>
                    {
                        Object.keys(selectedTours).length <= 0 &&
                        <h6 className="mb-4">Er zijn geen rondes geselecteerd</h6>
                    }
                    <ul>
                        {
                            Object.entries(selectedTours).map(([tourId, _] : [string, BuildingInterface[]]) => <li key={+tourId} value={+tourId}>{getTourName(+tourId)}
                                <Tooltip arrow placement="right" title="Verwijder">
                                    <IconButton onClick={() => removeTour(+tourId)}>
                                        <Delete/>
                                    </IconButton>
                                </Tooltip></li>)
                        }
                    </ul>
                </div>
                <Button className="btn-danger" onClick={() => {
                    removeAllBuildings()
                    closeModal();
                }}>
                    Verwijder alle gebouwen
                </Button>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" className="btn-dark" onClick={() => closeModal()}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
}