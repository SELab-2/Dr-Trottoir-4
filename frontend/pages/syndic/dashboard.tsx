import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";
import {withAuthorisation} from "@/components/withAuthorisation";
import {useRouter} from "next/router";
import {TiPencil} from "react-icons/ti";
import {BuildingInterface, getBuildingInfo, getBuildingsFromOwner} from "@/lib/building";
import {useEffect, useState} from "react";
import {AxiosResponse} from "axios/index";
import {Button, Form, Modal} from 'react-bootstrap';


interface ParsedUrlQuery {
}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}

function SyndicDashboard() {
    const router = useRouter();
    const query = router.query as DashboardQuery;

    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [editBuilding, setEditBuilding] = useState(false);

    useEffect(() => {
        if (!query.id) {
            return;
        }

        async function fetchBuilding() {
            getBuildingInfo(query.id)
                .then((buildings: AxiosResponse<any>) => {
                    setBuilding(buildings.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        fetchBuilding();
    }, [query.id]);

    return (
        <>
            <BaseHeader/>

            <div>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        router.push("/syndic/building");
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
                            <Form.Label>Stad</Form.Label>
                            <Form.Control defaultValue={building?.city} placeholder="Vul stad in"/>


                            <Form.Label>Public id</Form.Label>
                            <Form.Control defaultValue={building?.public_id}/>
                            <Form.Text className="text-muted">
                                De inwoners van uw gebouw kunnen info over vuilnisophaling zien op de link TODO
                            </Form.Text>
                        </Form.Group>


                        <Button variant="danger" onClick={e => {
                            e.preventDefault();
                            setEditBuilding(false);
                        }
                        }>
                            Annuleer
                        </Button>
                        <Button variant="primary" type="submit">
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
            <p>Naam: {building?.name}</p>
            <p>Stad: {building?.city}</p>
            <p>Postcode: {building?.postal_code}</p>
            <p>Straat: {building?.street}</p>
            <p>Nr: {building?.house_number}</p>
            <p>Bus: {building?.bus}</p>
            <p>Client id: {building?.client_id}</p>
            <p>Duration: {"" + building?.duration}</p>
            <p>Region: {building?.region_id}</p>
            <p>Public id: {building?.public_id}</p>

            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <Image src={soon} alt="Site coming soon" className={styles.image}/>
            <LogoutButton/>
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
