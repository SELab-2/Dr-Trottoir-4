import BaseHeader from "@/components/header/BaseHeader";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getTour, Tour} from "@/lib/tour";
import {getRegion, Region} from "@/lib/region";
import {BuildingInterface, getAllBuildings} from "@/lib/building";
import {BuildingOnTour, getAllBuildingsOnTour} from "@/lib/building-on-tour";
import Building from "@/pages/syndic/building";


interface ParsedUrlQuery {}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}


export default function AdminDataToursEdit() {
    const router = useRouter();
    const query : DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<Region>();
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);
    const [allBuildingsNotOnTour, setAllBuildingsNotOnTour] = useState<BuildingInterface[]>([]);

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (! query.tour) {
            return;
        }

        getTour(query.tour).then(res => {
            setTour(res.data);
        }, err => {
            console.error(err);
        });
    }, [router.isReady]);

    useEffect(() => {
        if (!tour) {
            return;
        }
        getRegion(tour.region).then(res => {
            setRegion(res.data);
        }, err => {
            console.error(err);
        });

        getAllBuildings().then(res => {
            const allBuildings : BuildingInterface[] = res.data;
            const buildingsInRegion = allBuildings.filter((building : BuildingInterface) => tour.region === building.region);
            setAllBuildings(buildingsInRegion);
        }, err => {
            console.error(err);
        });

        getAllBuildingsOnTour().then(res => {
           const allBuildingsOnTour : BuildingOnTour[] = res.data;
           allBuildingsOnTour.sort((a, b) => (a.index < b.index) ? -1 : 1);
           setBuildingsOnTour(allBuildingsOnTour.filter((buildingOnTour : BuildingOnTour) => buildingOnTour.tour === tour.id));

        }, err => {
            console.error(err);
        });
    }, [tour]);

    useEffect(() => {
        const allBuildingsNotOnTour = allBuildings.filter((building : BuildingInterface) =>

            ! buildingsOnTour.some((buildingOnTour : BuildingOnTour) => building.id === buildingOnTour.building)
        );
        setAllBuildingsNotOnTour(allBuildingsNotOnTour);
    }, [allBuildings,buildingsOnTour]);

    function getBuildingFromBuildingOnTour(buildingOnTour : BuildingOnTour) {
        const building : BuildingInterface | undefined = allBuildings.find((building : BuildingInterface) => buildingOnTour.building === building.id);
        if (!building) {
            return;
        }
        return building;
    }

    return (
        <>
            <>
                <BaseHeader />
                <p>Laatste aanpassing: {tour? (new Date(tour.modified_at)).toLocaleString() : ""}</p>
                <p>Tour : {tour?.name}</p>
                <p>Regio : {region?.region}</p>
                <div>Gebouwen: </div>
                <ol>
                    {
                        buildingsOnTour.map((buildingOnTour : BuildingOnTour, index : number) => {
                            const building = getBuildingFromBuildingOnTour(buildingOnTour);
                            return (
                                <li key={index}>{building?.city} {building?.postal_code}, {building?.street} {building?.house_number}</li>
                            );
                        })
                    }
                </ol>
                <div>Mogelijke toevoegingen:</div>
                <ul>
                    {
                        allBuildingsNotOnTour.map((building : BuildingInterface, index : number) => (
                            <li key={index}>{building.city} {building.postal_code}, {building.street} {building.house_number}</li>
                        ))
                    }
                </ul>
                <p>
                    https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=115-606&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
                </p>
            </>
        </>
    );
}
