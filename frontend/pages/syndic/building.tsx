import BaseHeader from "@/components/header/BaseHeader";
import {BuildingInterface, getBuildingInfo, patchBuildingInfo} from "@/lib/building";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import {AxiosResponse} from "axios";
import styles from "@/styles/Welcome.module.css";
import {Button, Form, Modal} from "react-bootstrap";
import {TiPencil} from "react-icons/ti";
import Image from "next/image";
import soon from "@/public/coming_soon.png";
import LogoutButton from "@/components/logoutbutton";

interface ParsedUrlQuery {
}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}


function SyndicBuilding() {

    const router = useRouter();
    const query = router.query as DashboardQuery;

    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [editBuilding, setEditBuilding] = useState(false);
    const [errorText, setErrorText] = useState("");

    const [formData, setFormData] = useState({
        name: null,
        public_id: null
    })

    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        console.log(event.target)
        console.log(`extracted name en value zijn ${name} en ${value}`)
        setFormData({
            ...formData,
            [name]: value,
        });

        console.log(`handleInputChange is dus gedaan, nu is formData ${JSON.stringify(formData)}`)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log(`In handleSubmit ${JSON.stringify(formData)}`)

        let toSend = {}
        for (const [key, value] of Object.entries(formData)) {
            if (value) {
                toSend[key] = value;
            }
        }

        patchBuildingInfo(query.id, formData).then(res => {
            setEditBuilding(false);
            setBuilding(res.data);
        }).catch(error => {
            console.log("We hebben een error")
            setErrorText(error.response.data.detail)
            console.log(error.response.data.detail)
            console.log(error);

        })

    }


    async function fetchBuilding() {
        getBuildingInfo(query.id)
            .then((buildings: AxiosResponse<any>) => {
                setBuilding(buildings.data);
            })
            .catch((error) => {
                console.log("We hebben een error")
                console.log(error);
            });
    }

    useEffect(() => {
        if (!query.id) {
            return;
        }
        fetchBuilding();
    }, [query.id]);


    function get_building_key(key: string) {
        if (building)
            return building[key] || "/";
        return "/";
    }

    return (
        <>
            <BaseHeader/>

            <div>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        router.push("/syndic/dashboard");
                    }}
                >
                    {" "}
                    ⮌ Terug naar het overzicht
                </a>
            </div>

            {JSON.stringify(building)}

            <h1 className={styles.title}>Welcome to the Syndic Dashboard!</h1>

            <Modal show={editBuilding} onHide={() => setEditBuilding(false)}>
                <Modal.Header closeButton>
                    Bewerk gebouw
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formPatchBuilding">
                            <Form.Group controlId={"name"}>
                                <Form.Label>Naam</Form.Label>
                                <Form.Control name="name" defaultValue={building?.name} onChange={handleInputChange}
                                              placeholder="Vul de naam van het gebouw in"/>
                            </Form.Group>

                            <Form.Label>Public id</Form.Label>
                            <Form.Group controlId="public_id">
                                <Form.Control name="public_id" defaultValue={building?.public_id}
                                              onChange={handleInputChange}
                                              placeholder="vul het public id van het gebouw in"/>
                                <Button variant={"success"} size={"sm"}>Willekeurig</Button>

                            </Form.Group>
                            <Form.Text className="text-muted">
                                De inwoners van uw gebouw kunnen info over vuilnisophaling zien op de link <a
                                href={`${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${building?.public_id}`}>
                                `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${building?.public_id}`
                            </a>
                            </Form.Text>
                        </Form.Group>

                        {/*TODO: below line should probably a custom component with a state boolean*/}
                        <div style={{background: "red"}}>{errorText}</div>

                        <Button variant="danger" onClick={e => {
                            e.preventDefault();
                            setEditBuilding(false);
                        }
                        }>
                            Annuleer
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            Opslaan (TODO: PATCH request)
                        </Button>

                    </Form>
                </Modal.Body>
            </Modal>


            <h1>
                Gebouw <TiPencil onClick={e => {
                e.preventDefault();
                setEditBuilding(true);
            }}></TiPencil>
            </h1>
            <p>Naam: {get_building_key("name")}</p>
            <p>Stad: {get_building_key("city")}</p>
            <p>Postcode: {get_building_key("postal_code")}</p>
            <p>Straat: {get_building_key("street")}</p>
            <p>Nr: {get_building_key("house_number")}</p>
            <p>Bus: {get_building_key("bus")}</p>
            <p>Region (todo): {get_building_key("region_id")}</p>
            <p>Werktijd: {get_building_key("duration")}</p>
            <p>Client id: {get_building_key("client_id")}</p>
            <p>Public id: {get_building_key("public_id")}</p>

            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <Image src={soon} alt="Site coming soon" className={styles.image}/>
            <LogoutButton/>
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
