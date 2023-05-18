import React, {useEffect, useState} from "react";
import {TiPencil} from "react-icons/ti";
import PatchBuildingSyndicModal from "@/components/building/buildingComponents/editModals/PatchBuildingSyndicModal";
import {BuildingInterface} from "@/lib/building";
import {getRegion} from "@/lib/region";
import {useRouter} from "next/router";
import {Button} from "react-bootstrap";
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {handleError} from "@/lib/error";
import ManualList from "@/components/manual/ManualList";

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
    const [regionName, setRegionName] = useState("");

    const publicId = building && building.public_id || "-";

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (building) {
            get_region_name();
        }
    }, [building]);

    useEffect(() => {
        if (type == "admin" && building) {
            router.push(`/admin/data/buildings/edit?building=${building.id}`);
        }
    }, [editBuilding]);

    async function get_region_name() {
        try {
            const region = await getRegion(building.region);
            const regionName = region.data.region;
            setRegionName(regionName);
            setErrorMessages([]);
        } catch (error) {
            setErrorMessages(handleError(error));
            setRegionName("/");
        }
    }

    function getPublicLink(fullLink = true) {
        return (
            (fullLink ? `${process.env.NEXT_PUBLIC_HOST}` : "") +
            `/public/building?id=${building?.public_id ? building?.public_id : "<public_id>"}`
        );
    }

    return (
        <div>
            {type === "syndic" && (
                <PatchBuildingSyndicModal
                    show={editBuilding}
                    closeModal={() => setEditBuilding(false)}
                    building={building}
                    setBuilding={setBuilding}
                />
            )}
            <label className="title">
                Gebouw
            </label>
            {building && (
                <div>
                    < p>
                        < strong> Naam:</strong> {building.name ? building.name : "-"}
                    </p>
                    <strong>Adres:</strong>
                    <p>
                        {building.street} {building.house_number}, {building.bus}
                        <br/>
                        {building.city} {building.postal_code}
                    </p>
                    <p>
                        <strong>Regio:</strong> {regionName}
                    </p>
                    <p>
                        <strong>Werktijd:</strong> {building.duration}
                    </p>
                    <p>
                        <strong>Klant id:</strong> {building.client_number ? building.client_number : "-"}
                    </p>
                    {type != "public" ? (
                        <p style={{wordWrap: 'break-word', width: '100%', maxWidth: '100%'}}
                            title={`De inwoners van het gebouw kunnen de info van dit gebouw raadplegen via de link: 
                        ${getPublicLink()}`}
                        >
                            <strong>Publiek id:</strong><br/>
                            {publicId && publicId !== "-" ? (
                                <a href={getPublicLink(false)} target={"_blank"}>
                                    {publicId}
                                </a>
                            ) : (
                                publicId
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
                </div>
            )}
            {type === "syndic" && (
                <div className="padding" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>

                    <Button
                        size="lg"
                        className="wide_button"
                        onClick={(e) => {
                            e.preventDefault();
                            setEditBuilding(true);
                        }}
                    >
                        <TiPencil/> Bewerk
                    </Button>
                </div>
            )}
        </div>
    );
}

export default BuildingInfo;
