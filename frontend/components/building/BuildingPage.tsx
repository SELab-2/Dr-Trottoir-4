import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {BuildingInterface, getBuildingInfo, getBuildingInfoByPublicId} from "@/lib/building";
import {AxiosResponse} from "axios/index";
import BuildingInfo from "@/components/building/buildingComponents/BuildingInfo";
import LatestCollections from "@/components/building/buildingComponents/LatestCollections";
import CollectionCards from "@/components/building/buildingComponents/CollectionCards";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";


interface BuildingQuery {
    id?: string;
    date?: string;
}

function BuildingPage({type}: { type: "syndic" | "admin" | "public" }) {
    const router = useRouter();
    const query = router.query as BuildingQuery;

    // @ts-ignore
    const [building, setBuilding] = useState<BuildingInterface>(null);

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    async function fetchBuilding() {
        if (type !== "public" /*&& /^\d+$/.test(query.id+"")*/) {
            getBuildingInfo(Number(query.id))
                .then((buildings: AxiosResponse) => {
                    setBuilding(buildings.data);
                    setErrorMessages([]);
                })
                .catch((error) => {
                    setErrorMessages(handleError(error));
                });
        } else {
            getBuildingInfoByPublicId(query.id)
                .then((buildings: AxiosResponse) => {
                    setBuilding(buildings.data);
                    setErrorMessages([]);
                })
                .catch((error) => {
                    setErrorMessages(handleError(error));
                });
        }
    }

    useEffect(() => {
        if (!query.id) {
            return;
        }
        fetchBuilding();
    }, [query.id]);

    return (
        <>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>

            <div style={{display: "flex", justifyContent: "space-evenly"}}>
                <div style={{flex: "1"}}>
                    <BuildingInfo building={building} setBuilding={setBuilding} type={type}/>
                </div>
                <div style={{flex: "1"}}>
                    <CollectionCards building={building ? building.id : 0} date={query.date ? query.date : null}/>
                </div>
                <div style={{flex: "1"}}>
                    <LatestCollections building={building ? building.id : 0}/>
                </div>
            </div>
        </>
    );
}

export default BuildingPage;
