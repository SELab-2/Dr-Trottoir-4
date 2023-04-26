import { BuildingInterface, BuildingPostInterface } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
    getNewPublicIdUtil,
    handleInputChangeUtil,
    handleSubmitUtil,
} from "@/components/building/buildingComponents/editModals/handleUtil";

/*
TODO: this page should be shown on click with a row in the tables
 */

function PatchBuildingAdminModal({
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
    const [formData, setFormData] = useState<BuildingPostInterface>({
        bus: "",
        city: "",
        client_number: "",
        duration: "",
        house_number: "",
        name: "",
        postal_code: "",
        public_id: "",
        region: 0,
        street: "",
        syndic: 0,
    });

    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        setFormData({
            syndic: building ? building.syndic : 0,
            bus: building ? building.bus : "",
            city: building ? building.city : "",
            client_number: building ? building.client_number : "",
            duration: building ? building.duration : "",
            house_number: building ? building.house_number : "",
            name: building ? building.name : "",
            postal_code: building ? building.postal_code : "",
            public_id: building ? building.public_id : "",
            region: building ? building.region : 0,
            street: building ? building.street : "",
        });
    }, [building]);

    const newPublicId = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();

        try {
            getNewPublicIdUtil(event, formData, setFormData);
        } catch (error) {
            //TODO: generic component
            console.error(JSON.stringify(error));
        }
    };

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();

        try {
            await handleSubmitUtil(event, formData, building, setBuilding, closeModal);
        } catch (error: any) {
            //TODO: generic error component
            setErrorText(JSON.stringify(error.response.data));
        }
    };

    return (
        <>
            <Modal show={show} onHide={closeModal}>
                <Modal.Header closeButton>Bewerk gebouw</Modal.Header>
                <Modal.Body>
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

                            {/*TODO: dropdown maken met alle syndics*/}
                            <Form.Group controlId={"syndic"}>
                                <Form.Label>Syndicus</Form.Label>
                                <Form.Control
                                    name="syndic"
                                    value={formData.syndic}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de id van de syndicus in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"city"}>
                                <Form.Label>Stad</Form.Label>
                                <Form.Control
                                    name="city"
                                    value={formData.city}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul naam van de stad in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"postal_code"}>
                                <Form.Label>Postcode</Form.Label>
                                <Form.Control
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de postcode in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"street"}>
                                <Form.Label>Postcode</Form.Label>
                                <Form.Control
                                    name="street"
                                    value={formData.street}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de straat in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"house_number"}>
                                <Form.Label>Huisnummer</Form.Label>
                                <Form.Control
                                    name="house_number"
                                    value={formData.house_number}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul het huisnummer in"
                                />
                            </Form.Group>

                            {/*TODO: dropdown maken met alle regio's*/}
                            <Form.Group controlId={"region"}>
                                <Form.Label>Regio</Form.Label>
                                <Form.Control
                                    name="region"
                                    value={formData.region}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de regio in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"bus"}>
                                <Form.Label>Bus</Form.Label>
                                <Form.Control
                                    name="bus"
                                    value={formData.bus}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul het busnummer in"
                                />
                            </Form.Group>

                            <Form.Group controlId={"client_number"}>
                                <Form.Label>Client ID</Form.Label>
                                <Form.Control
                                    name="client_number"
                                    value={formData.client_number}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de client id in"
                                />
                            </Form.Group>

                            {/*TODO: duur moet een time veld zijn*/}
                            <Form.Group controlId={"duration"}>
                                <Form.Label>Duur</Form.Label>
                                <Form.Control
                                    name="duration"
                                    value={formData.duration}
                                    onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                    placeholder="Vul de duur in"
                                />

                                <Form.Group controlId="public_id">
                                    <Form.Label>Public id</Form.Label>
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
                                    <a
                                        href={
                                            building?.public_id
                                                ? `${process.env.NEXT_PUBLIC_HOST}public/building/${building?.public_id}`
                                                : "#"
                                        }
                                    >
                                        {`${process.env.NEXT_PUBLIC_HOST}public/building/${
                                            building?.public_id ? building?.public_id : "<public_id>"
                                        }`}
                                    </a>
                                </Form.Text>
                            </Form.Group>

                            {/*TODO: below line should probably a custom component with a state boolean*/}
                            <div style={{ background: "red" }}>{errorText}</div>

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
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default withAuthorisation(PatchBuildingAdminModal, ["Admin"]);
