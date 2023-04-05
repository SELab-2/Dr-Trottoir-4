import {TiPencil} from "react-icons/ti";
import React, {useEffect, useState} from "react";
import PatchBuildingSyndicModal from "@/components/syndic/building/PatchBuildingSyndicModal";
import {BuildingInterface} from "@/lib/building";
import {getRegion, RegionInterface} from "@/lib/region";


function BuildingSyndicInfo({
                                building,
                                setBuilding
                            }: {
    building: BuildingInterface;
    setBuilding: (b: any) => void;
}) {

    const [editBuilding, setEditBuilding] = useState(false);
    const [regionName, setRegionName] = useState("/")

    useEffect(() => {
        if (building) {
            get_region_name("region");
        }
    }, [building]);

    function get_building_key(key: string) {
        if (building) {
            // @ts-ignore
            return building[key] || "/";
        }
        return "/";
    }

    async function get_region_name(key: string) {
        const region_id = get_building_key("region")

        if (isNaN(region_id)) {
            setRegionName("/");
        }

        try {
            const region = await getRegion(region_id);
            const regionName = region.data.region;
            setRegionName(regionName);
        } catch (error) {
            console.error(error);
            setRegionName("/");
        }
    }

    return (
        <>
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
            <p>ID: {get_building_key("id")} </p>
            <p>Naam: {get_building_key("name")}</p>
            <p>Stad: {get_building_key("city")}</p>
            <p>Postcode: {get_building_key("postal_code")}</p>
            <p>Straat: {get_building_key("street")}</p>
            <p>Nr: {get_building_key("house_number")}</p>
            <p>Bus: {get_building_key("bus")}</p>
            <p>RegionInterface: {regionName}  </p>
            <p>Werktijd: {get_building_key("duration")}</p>
            <p>Client id: {get_building_key("client_id")}</p>
            <p>Public id: {get_building_key("public_id")}</p>
        </>

    )
}

export default BuildingSyndicInfo;
