import { BuildingInterface, getBuildingInfo } from "@/lib/building";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { withAuthorisation } from "@/components/withAuthorisation";
import { AxiosResponse } from "axios";
import SyndicHeader from "@/components/header/syndicHeader";
import SyndicFooter from "@/components/footer/syndicFooter";
import BuildingSyndicInfo from "@/components/syndic/building/BuildingInfo";
import LatestCollections from "@/components/syndic/building/LatestCollections";
import LatestCollectionDetail from "@/components/syndic/building/LatestCollectionDetail";

interface ParsedUrlQuery {}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}

function SyndicBuilding() {
    const router = useRouter();
    const query = router.query as DashboardQuery;

    // @ts-ignore
    const [building, setBuilding] = useState<BuildingInterface>(null);

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

    // https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486

    return (
        <>
            <SyndicHeader />

            <div style={{ display: "flex" }}>
                <div style={{ flex: "1" }}>
                    <BuildingSyndicInfo building={building} setBuilding={setBuilding} />
                </div>
                <div style={{ flex: "1" }}>
                    <LatestCollectionDetail building={building ? building.id : 0} />
                </div>
                <div style={{ flex: "1" }}>
                    <LatestCollections building={building ? building.id : 0} />
                </div>
            </div>

            <SyndicFooter />
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
