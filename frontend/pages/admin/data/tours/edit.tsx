import BaseHeader from "@/components/header/BaseHeader";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getTour, Tour} from "@/lib/tour";
import {getRegion, Region} from "@/lib/region";
import {BuildingInterface, getAllBuildings} from "@/lib/building";
import {BuildingOnTour, getAllBuildingsOnTour, getAllBuildingsOnTourWithTourID} from "@/lib/building-on-tour";
import Building from "@/pages/syndic/building";


interface ParsedUrlQuery {}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}

type BuildingOnTourView = {
    buildingName : string,
    city : string,
    postalCode : string,
    street : string,
    houseNumber : number,
    bus : string,
    buildingId : number,
    index : number,
}

type BuildingNotOnTourView = {
    buildingName : string,
    city : string,
    postalCode : string,
    street : string,
    houseNumber : number,
    bus : string,
    buildingId : number,
}

export default function AdminDataToursEdit() {
    const router = useRouter();
    const query : DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<Region>();
    const [allBuildingsInRegion, setAllBuildingsInRegionInRegion] = useState<BuildingInterface[]>([]);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);

    const [buildingsOnTourView, setBuildingsOnTourView] = useState<BuildingOnTourView[]>([]);
    const [buildingsNotOnTourView, setBuildingsNotOnTourView] = useState<BuildingNotOnTourView[]>([]);


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
            setAllBuildingsInRegionInRegion(buildingsInRegion);
        }, err => {
            console.error(err);
        });

        getAllBuildingsOnTourWithTourID(tour.id).then(res => {
           const allBuildingsOnTour : BuildingOnTour[] = res.data;
           setBuildingsOnTour(allBuildingsOnTour);
        }, err => {
            console.error(err);
        });
    }, [tour]);

    useEffect(() => {
        getBuildingsOnTourView();
        getBuildingsNotOnTourView();
    }, [allBuildingsInRegion, buildingsOnTour]);

    function getBuildingsOnTourView() {
        let botV : BuildingOnTourView[] = buildingsOnTour.map((buildingOnTour : BuildingOnTour) => {
            const building : BuildingInterface = allBuildingsInRegion.find((building : BuildingInterface) => buildingOnTour.building === building.id)!; // This will not be undefined hence '!'
            return {
                buildingName : building?.name,
                city : building?.city,
                postalCode : building?.postal_code,
                street : building?.street,
                houseNumber : building?.house_number,
                bus : building?.bus,
                buildingId : building?.id,
                index : buildingOnTour.index,
            };
        });
        botV.sort((a : BuildingOnTourView, b : BuildingOnTourView) => a.index < b.index ? -1 : 1);
        setBuildingsOnTourView(botV);
    }

    function getBuildingsNotOnTourView() {
        const allBuildingsNotOnTour = allBuildingsInRegion.filter((building : BuildingInterface) =>
            ! buildingsOnTour.some((buildingOnTour : BuildingOnTour) => building.id === buildingOnTour.building)
        );
        const bnotV : BuildingNotOnTourView[] = allBuildingsNotOnTour.map((building : BuildingInterface) => {
           return {
               buildingName : building.name,
               city : building.city,
               postalCode : building.postal_code,
               street : building.street,
               houseNumber : building.house_number,
               bus : building.bus,
               buildingId : building.id,
           };
        });
        setBuildingsNotOnTourView(bnotV);
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
                        buildingsOnTourView.map((view : BuildingOnTourView, index : number) => {
                            return (
                                <li key={index}>{view.street} {view.houseNumber}</li>
                            );
                        })
                    }
                </ol>
                <div>Mogelijke toevoegingen:</div>
                <ul>
                    {
                        buildingsNotOnTourView.map((view : BuildingNotOnTourView, index : number) => (
                            <li key={index}>{view.street} {view.houseNumber}</li>
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
