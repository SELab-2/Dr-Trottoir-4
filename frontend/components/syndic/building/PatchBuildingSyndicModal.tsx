import React, {ChangeEvent, MouseEventHandler, useEffect, useState} from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import {Button, Form, Modal} from "react-bootstrap";
import {BuildingInterface, generateNewPublicId, getNewPublicId, patchBuildingInfo} from "@/lib/building";
import build from "next/dist/build";

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

    interface formData {
        name: string,
        public_id: string
    }

    const [formData, setFormData] = useState<formData>({
        name: "",
        public_id: "",
    });
    const [errorText, setErrorText] = useState("");


    useEffect(() => {
        setFormData({
            name: building ? building.name : "",
            public_id: building ? building.public_id : ""
        });
    }, [building]);


    const newPublicId = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();

        console.log(`Building id is ${building?.id}`)

        getNewPublicId()
            .then((res) => {
                //setBuilding(res.data);
                setFormData({
                    ...formData,
                    public_id: res.data.public_id,
                });
            })
            .catch((error) => {
                //TODO: generieke functie nodig voor error messages
                console.error(error);
            });
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const name = event.target.name;
        const value = event.target.value;

        setFormData({
            ...formData,
            [name]: value,
        });

        console.log(`handleInputChange is dus gedaan, nu is formData ${JSON.stringify(formData)}`);
    };

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        event?.preventDefault();

        console.log("form data")
        console.log(formData)

        console.log(`In handleSubmit ${JSON.stringify(formData)}`);

        let toSend: any = {};
        for (const [key, value] of Object.entries(formData)) {
            // @ts-ignore
            if (value && (!building || building[key] != value)) {
                toSend[key] = value;
            }
        }


        if (Object.keys(toSend).length === 0)
            return

        patchBuildingInfo("" + building?.id, toSend)
            .then((res) => {
                setBuilding(res.data);
                closeModal();
            })
            .catch((error) => {
                // TODO: generieke functie
                console.log("We hebben een error");
                setErrorText(error.response.data.detail);
                console.log(error.response.data.detail);
                console.log(error);
            });
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
                                    onChange={handleInputChange}
                                    placeholder="Vul de naam van het gebouw in"
                                />
                            </Form.Group>

                            <Form.Label>Public id</Form.Label>
                            <Form.Group controlId="public_id">
                                <Form.Control
                                    name="public_id"
                                    value={formData.public_id}
                                    onChange={handleInputChange}
                                    placeholder="vul het public id van het gebouw in"
                                />
                                <Button variant={"success"} size={"sm"} onClick={newPublicId}>
                                    Willekeurig
                                </Button>
                            </Form.Group>
                            <Form.Text className="text-muted">
                                De inwoners van uw gebouw kunnen info over vuilnisophaling zien op de link{" "}
                                <a
                                    href={`${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${building?.public_id}`}
                                >
                                    `${process.env.NEXT_PUBLIC_BASE_API_URL}$
                                    {process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${building?.public_id}`
                                </a>
                            </Form.Text>
                        </Form.Group>

                        {/*TODO: below line should probably a custom component with a state boolean*/}
                        <div style={{background: "red"}}>{errorText}</div>

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
