<<<<<<< HEAD
import { withAuthorisation } from "@/components/withAuthorisation";
import router from "next/router";
import { BuildingInterface, getBuildingsFromOwner } from "@/lib/building";
=======
import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";
import { withAuthorisation } from "@/components/with-authorisation";
import { useRouter } from "next/router";
import { TiPencil } from "react-icons/ti";
import { BuildingInterface, getBuildingInfo, getBuildingsFromOwner } from "@/lib/building";
>>>>>>> feature/tour-simon
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";

function SyndicDashboard() {
    const [id, setId] = useState("");
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        setId(sessionStorage.getItem("id") || "");
    }, []);

    useEffect(() => {
        console.log("hier");

        if (!id) {
            console.log(`nog geen id ${id}`);
            return;
        }

        console.log(`id is ${id}`);

        async function fetchBuildings() {
            getBuildingsFromOwner(id)
                .then((buildings: AxiosResponse<any>) => {
                    setBuildings(buildings.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        fetchBuildings();
    }, [id]);

    if (!id || !buildings) {
        //TODO: loading component, how to use? Maybe with a wrappen and a state boolean?
        return <div>loading...</div>;
    }

    return (
        <>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1145&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>

            <h1>Uw gebouwen</h1>

            <div className="row">
                {buildings.map((building: BuildingInterface) => {
                    // console.log(building);
                    return (
                        <div
                            className="col-md-4 mb-3"
                            key={building.id}
                            onClick={(e) => {
                                e.preventDefault();
                                router.push({
                                    pathname: "building",
                                    query: { id: building.id },
                                });
                            }}
                        >
<<<<<<< HEAD
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {building.name} {building.postal_code} {building.city}
                                    </h5>
                                    <p className="card-text">
                                        {building.street} {building.house_number}{" "}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
=======
                            Annuleer
                        </Button>
                        <Button variant="primary" type="submit">
                            Opslaan (TODO: PATCH request)
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <h1>
                Gebouw{" "}
                <TiPencil
                    onClick={(e) => {
                        e.preventDefault();
                        setEditBuilding(true);
                    }}
                ></TiPencil>
            </h1>
            <p>Naam: {building?.name}</p>
            <p>Stad: {building?.city}</p>
            <p>Postcode: {building?.postal_code}</p>
            <p>Straat: {building?.street}</p>
            <p>Nr: {building?.house_number}</p>
            <p>Bus: {building?.bus}</p>
            <p>Client id: {building?.client_id}</p>
            <p>Duration: {"" + building?.duration}</p>
            <p>Region: {building?.region}</p>
            <p>Public id: {building?.public_id}</p>

            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <Image src={soon} alt="Site coming soon" className={styles.image} />
            <LogoutButton />
>>>>>>> feature/tour-simon
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
