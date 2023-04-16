import {Button, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {BuildingInterface, getAddress} from "@/lib/building";
import {getRemarksOfBuilding, RemarkAtBuilding} from "@/lib/remark-at-building";

export default function BuildingOverview(
    {
        show,
        closeModal,
        building,
        finish
    }: {
        show: boolean,
        closeModal: () => void,
        building : BuildingInterface | null,
        finish : boolean
    }
) {

    const [remarks, setRemarks] = useState<RemarkAtBuilding[]>([]);

    function retrieveRemarks() {
        if (! building) {
            return;
        }
        // Change this to the correct student information,
        // now it is only filtered on building but needs to also be filtered on student
        /*getRemarksOfBuilding(building.id).then(res => {
            const r : RemarkAtBuilding[] = res.data;
            setRemarks(r);
            console.log(r);
        }, console.error);*/
    }

    return (
        <Modal show={show} onShow={() => {
            console.log(building);
            retrieveRemarks();
        }}>
            <Modal.Header>
                <Modal.Title>Overzicht gebouw</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{building ? getAddress(building) : ""}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={() => {
                        closeModal();
                    }}
                >
                    {finish ? "Beëindig ronde": "Volgende gebouw"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}