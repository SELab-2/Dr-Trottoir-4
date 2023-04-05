import { BuildingInterface, getBuildingInfo } from "@/lib/building";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { withAuthorisation } from "@/components/withAuthorisation";
import { AxiosResponse } from "axios";
import styles from "@/styles/Welcome.module.css";
import { TiPencil } from "react-icons/ti";
import PatchBuildingSyndicModal from "@/components/syndic/PatchBuildingSyndicModal";
import SyndicHeader from "@/components/header/syndicHeader";

interface ParsedUrlQuery {}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}

function SyndicBuilding() {
    const router = useRouter();
    const query = router.query as DashboardQuery;

    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [editBuilding, setEditBuilding] = useState(false);

    async function fetchBuilding() {
        getBuildingInfo(Number(query.id))
            .then((buildings: AxiosResponse<any>) => {
                setBuilding(buildings.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        if (!query.id) {
            return;
        }
        fetchBuilding();
    }, [query.id]);

    function get_building_key(key: string) {
        if (building) {
            // @ts-ignore
            return building[key] || "/";
        }
        return "/";
    }

    return (
        <>
            <SyndicHeader />
            <div>
                <a
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
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

            <PatchBuildingSyndicModal
                show={editBuilding}
                closeModal={() => setEditBuilding(false)}
                building={building}
                setBuilding={setBuilding}
            />

            <h1>
                Gebouw{" "}
                <TiPencil
                    onClick={(e) => {
                        e.preventDefault();
                        setEditBuilding(true);
                    }}
                ></TiPencil>
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
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
