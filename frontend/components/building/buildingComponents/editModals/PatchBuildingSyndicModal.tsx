import React, { useEffect, useState } from "react";
import { withAuthorisation } from "@/components/withAuthorisation";
import { Button, Form, Modal } from "react-bootstrap";
import { BuildingInterface, BuildingSyndicPostInterface } from "@/lib/building";
import {
    getNewPublicIdUtil,
    handleInputChangeUtil,
    handleSubmitUtil,
} from "@/components/building/buildingComponents/editModals/handleUtil";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function PatchBuildingSyndicModal({
    show,
    closeModal,
    building,
    setBuilding,
}: {
    show: boolean;
    closeModal: () => void;
    building: BuildingInterface | null;
    setBuilding: (x: any) => void;
}) {
    const [formData, setFormData] = useState<BuildingSyndicPostInterface>({
        name: "",
        public_id: "",
    });

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        setFormData({
            name: building ? building.name : "",
            public_id: building ? building.public_id : "",
        });
    }, [building]);

    const newPublicId = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();
        getNewPublicIdUtil(event, formData, setFormData, setErrorMessages);
    };

    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();

        handleSubmitUtil(event, formData, building, setBuilding, closeModal, setErrorMessages);
    };

    return (
        <>
            <Modal show={show} onHide={closeModal}>
                <Modal.Header closeButton>Bewerk gebouw</Modal.Header>
                <Modal.Body>
                    <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
                    <Form>
                        <Form.Group className="mb-3" controlId="formPatchBuilding">
                            <Form.Group controlId={"name"}>
                                <Form.Label>Naam</Form.Label>
                                <Form.Control
                                    name="name"
                                    value={formData.name}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de naam van het gebouw in"
                                />
                            </Form.Group>

                            <Form.Label>Public id</Form.Label>
                            <Form.Group controlId="public_id">
                                <Form.Control
                                    name="public_id"
                                    value={formData.public_id}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="vul het public id van het gebouw in"
                                />
                                <Button variant={"success"} size={"sm"} onClick={newPublicId}>
                                    Willekeurig
                                </Button>
                            </Form.Group>
                            <Form.Text className="text-muted">
                                De inwoners van uw gebouw kunnen info over vuilnisophaling zien op de link{" "}
                                <a href={building?.public_id ? `/public/building?id=${building?.public_id}` : ""}>
                                    {`${process.env.NEXT_PUBLIC_HOST}/public/building?id=${
                                        building?.public_id ? building?.public_id : "<public_id>"
                                    }`}
                                </a>
                            </Form.Text>
                        </Form.Group>

                        <Button
                            variant="danger"
                            onClick={(e) => {
                                e.preventDefault();
                                closeModal();
                            }}
                        >
                            Annuleer
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            Opslaan
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default withAuthorisation(PatchBuildingSyndicModal, ["Syndic"]);
