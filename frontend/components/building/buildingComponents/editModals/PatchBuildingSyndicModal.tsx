import React, {useEffect, useState} from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import {Button, Form, FormControl, InputGroup, Modal} from "react-bootstrap";
import {BuildingInterface, BuildingSyndicPostInterface} from "@/lib/building";
import {
    getNewPublicIdUtil,
    handleInputChangeUtil,
    handleSubmitUtil,
} from "@/components/building/buildingComponents/editModals/handleUtil";
import {IconButton} from "@mui/material";
import {Casino} from "@mui/icons-material";

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

    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        setFormData({
            name: building ? building.name : "",
            public_id: building ? building.public_id : "",
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
            <Modal
                show={show}
                onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Bewerk gebouw</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formPatchBuilding">
                            <Form.Group controlId={"name"}>
                                <Form.Label className="normal_text">Naam:</Form.Label>
                                <InputGroup className="input">
                                    <Form.Control
                                        className="form_control"
                                        name="name"
                                        value={formData.name}
                                        onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                        placeholder="Vul de naam van het gebouw in"
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form>
                                <Form.Group controlId="public_id">
                                    <Form.Label className="normal_text">Publiek id:</Form.Label>
                                    <InputGroup className="input">
                                        <FormControl
                                            className="form_control"
                                            name="public_id"
                                            value={formData.public_id}
                                            onChange={(event) => handleInputChangeUtil(event, formData, setFormData)}
                                            placeholder="Vul het public id van het gebouw in"
                                        />
                                        <IconButton
                                            style={{
                                                backgroundColor: 'lightgray',
                                                borderBottomRightRadius: '5px', borderTopRightRadius: '5px'
                                            }}
                                            onClick={newPublicId}>
                                            <Casino/>
                                        </IconButton>
                                    </InputGroup>
                                </Form.Group>
                            </Form>
                            <Form.Text className="text-muted">
                                De inwoners van uw gebouw kunnen info over vuilnisophaling zien op onderstaande
                                link<br/>
                                <a href={building?.public_id ? `/public/building?id=${building?.public_id}` : ""}>
                                    {`${process.env.NEXT_PUBLIC_HOST}/public/building?id=${
                                        building?.public_id ? building?.public_id : "<public_id>"
                                    }`}
                                </a>
                            </Form.Text>
                        </Form.Group>

                        {/*TODO: below line should probably a custom component with a state boolean*/}
                        <div style={{background: "red"}}>{errorText}</div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Sluit
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Sla op
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default withAuthorisation(PatchBuildingSyndicModal, ["Syndic"]);
