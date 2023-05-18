import { TiPencil } from "react-icons/ti";
import React, { useEffect, useState } from "react";
import PatchBuildingSyndicModal from "@/components/building/buildingComponents/editModals/PatchBuildingSyndicModal";
import { BuildingInterface } from "@/lib/building";
import { getRegion } from "@/lib/region";
import { useRouter } from "next/router";
import ManualList from "@/components/manual/ManualList";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { getAllBuildingCommentsByBuildingID } from "@/lib/building-comment";

interface BuildingQuery {
    id?: string;
}

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
    const query = router.query as BuildingQuery;

    const [editBuilding, setEditBuilding] = useState(false);
    const [regionName, setRegionName] = useState("/");
    const [buildingComment, setBuildingComment] = useState<string>("Geen opmerkingen");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (building) {
            get_region_name("region");
            getBuildingComment();
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

    function getBuildingComment() {
        getAllBuildingCommentsByBuildingID(building.id, true)
            .then((comment) => {
                if (comment.data.length > 0) {
                    setBuildingComment(comment.data.comment);
                } else {
                    setBuildingComment("Geen opmerkingen");
                }
            })
            .catch((error) => {
                setErrorMessages(handleError(error));
                setBuildingComment("Geen opmerkingen");
            });
    }

    function getPublicLink(fullLink = true) {
        return (
            (fullLink ? `${process.env.NEXT_PUBLIC_HOST}` : "") +
            `/public/building?id=${building?.public_id ? building?.public_id : "<public_id>"}`
        );
    }

    return (
        <>
            {type === "syndic" ? (
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
                ) : type == "admin" ? (
                    <TiPencil
                        className={"clickable"}
                        onClick={(e) => {
                            e.preventDefault();
                            router.push(`/admin/data/buildings/edit?building=${building.id}`);
                        }}
                    ></TiPencil>
                ) : null}
            </h1>

            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />

            {type != "public" ? (
                <div>
                    <h3>Algemene opmerking</h3>
                    <p>{buildingComment}</p>
                    <br />
                </div>
            ) : null}

            <p>ID: {get_building_key("id")} </p>
            <p>Naam: {get_building_key("name")}</p>
            <p>Stad: {get_building_key("city")}</p>
            <p>Postcode: {get_building_key("postal_code")}</p>
            <p>Straat: {get_building_key("street")}</p>
            <p>Nr: {get_building_key("house_number")}</p>
            <p>Bus: {get_building_key("bus")}</p>
            <p>Regio: {regionName} </p>
            <p>Werktijd: {get_building_key("duration")}</p>
            <p>Client id: {get_building_key("client_id")}</p>

            {type != "public" ? (
                <p
                    title={`De inwoners van het gebouw kunnen de info van dit gebouw raadplegen via de link: 
                        ${getPublicLink()}`}
                >
                    Public id:{" "}
                    {building?.public_id ? (
                        <a href={getPublicLink(false)} target={"_blank"}>
                            {get_building_key("public_id")}
                        </a>
                    ) : (
                        get_building_key("public_id")
                    )}
                </p>
            ) : null}

            <br />

            {query.id && type != "public" ? (
                <>
                    <h3>Handleiding</h3>
                    <ManualList id={query.id} type={type} />
                </>
            ) : null}
        </>
    );
}

export default BuildingInfo;
