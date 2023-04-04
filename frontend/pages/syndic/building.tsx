import {BuildingInterface, getBuildingInfo} from "@/lib/building";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import {AxiosResponse} from "axios";
import styles from "@/styles/Welcome.module.css";
import {TiPencil} from "react-icons/ti";
import PatchBuildingSyndicModal from "@/components/syndic/building/PatchBuildingSyndicModal";
import SyndicHeader from "@/components/header/syndicHeader";
import {getRegion} from "@/lib/region";
import SyndicFooter from "@/components/footer/syndicFooter";
import BuildingSyndicInfo from "@/components/syndic/building/BuildingInfo";

interface ParsedUrlQuery {
}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}

function SyndicBuilding() {
    const router = useRouter();
    const query = router.query as DashboardQuery;

    // @ts-ignore
    const [building, setBuilding] = useState<BuildingInterface>(null);


    async function fetchBuilding() {
        getBuildingInfo(query.id)
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


    return (
        <>
            <SyndicHeader/>

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

            <details open={true} >
                <summary>Building info</summary>
                <BuildingSyndicInfo building={building} setBuilding={setBuilding}/>
            </details>


            <details open={true} >
                <summary>Recente ophalingen</summary>
                <h1>Recente ophalingen</h1>

            </details>

            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>

            <SyndicFooter />
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);