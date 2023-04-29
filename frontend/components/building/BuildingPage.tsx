import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { BuildingInterface, getBuildingInfo } from "@/lib/building";
import { AxiosResponse } from "axios/index";
import BuildingInfo from "@/components/building/buildingComponents/BuildingInfo";
import LatestCollectionDetail from "@/components/building/buildingComponents/LatestCollectionDetail";
import LatestCollections from "@/components/building/buildingComponents/LatestCollections";

interface ParsedUrlQuery {}

interface DashboardQuery extends ParsedUrlQuery {
    id?: string;
}

function BuildingPage({ type }: { type: "syndic" | "admin" | "" }) {
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
            <div style={{ display: "flex" }}>
                <div style={{ flex: "1" }}>
                    <BuildingInfo building={building} setBuilding={setBuilding} type={type} />
                </div>
                <div style={{ flex: "1" }}>
                    <LatestCollectionDetail building={building ? building.id : 0} />
                </div>
                <div style={{ flex: "1" }}>
                    <LatestCollections building={building ? building.id : 0} />
                </div>
            </div>
        </>
    );
}

export default BuildingPage;
