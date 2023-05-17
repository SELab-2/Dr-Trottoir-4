import { TiPencil } from "react-icons/ti";
import React, { useEffect, useState } from "react";
import PatchBuildingSyndicModal from "@/components/building/buildingComponents/editModals/PatchBuildingSyndicModal";
import { BuildingInterface } from "@/lib/building";
import { getRegion } from "@/lib/region";
import { useRouter } from "next/router";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function BuildingInfo({
    building,
    setBuilding,
    type,
}: {
    building: BuildingInterface;
    setBuilding: (b: any) => void;
    type: "syndic" | "admin" | "public";
}) {
    const router = useRouter();
    const [editBuilding, setEditBuilding] = useState(false);
    const [regionName, setRegionName] = useState("/");

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (building) {
            get_region_name("region");
        }
    }, [building]);

    useEffect(() => {
        if (type == "admin" && building) {
            router.push(`/admin/data/buildings/edit?building=${building.id}`);
        }
    }, [editBuilding]);

    function get_building_key(key: string) {
        if (building) {
            // @ts-ignore
            return building[key] || "/";
        }
        return "/";
    }

    async function get_region_name(key: string) {
        const region_id = get_building_key("region");

        if (isNaN(region_id)) {
            setRegionName("/");
        }

        try {
            const region = await getRegion(region_id);
            const regionName = region.data.region;
            setRegionName(regionName);
            setErrorMessages([]);
        } catch (error) {
            setErrorMessages(handleError(error));
            setRegionName("/");
        }
    }

    return (
        <>
            {type == "syndic" ? (
                <PatchBuildingSyndicModal
                    show={editBuilding}
                    closeModal={() => setEditBuilding(false)}
                    building={building}
                    setBuilding={setBuilding}
                />
            ) : null}

            <h1>
                Gebouw{" "}
                {type == "syndic" ? (
                    <TiPencil
                        className={"clickable"}
                        onClick={(e) => {
                            e.preventDefault();
                            setEditBuilding(true);
                        }}
                    ></TiPencil>
                ) : null}
            </h1>

            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />

            <p>ID: {get_building_key("id")} </p>
            <p>Naam: {get_building_key("name")}</p>
            <p>Stad: {get_building_key("city")}</p>
            <p>Postcode: {get_building_key("postal_code")}</p>
            <p>Straat: {get_building_key("street")}</p>
            <p>Nr: {get_building_key("house_number")}</p>
            <p>Bus: {get_building_key("bus")}</p>
            <p>Region: {regionName} </p>
            <p>Werktijd: {get_building_key("duration")}</p>
            <p>Client id: {get_building_key("client_id")}</p>
            <p>Public id: {get_building_key("public_id")}</p>
        </>
    );
}

export default BuildingInfo;
