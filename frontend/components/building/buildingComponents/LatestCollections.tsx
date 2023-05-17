import { GarbageCollectionInterface, getGarbageCollectionFromBuilding } from "@/lib/garbage-collection";
import React, { useEffect, useState } from "react";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { convertToSensibleDateShort } from "@/lib/dateUtil";

function LatestCollections({ building }: { building: number }) {
    const [collections, setCollections] = useState<GarbageCollectionInterface[]>([]);

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (building) {
            const date = new Date();
            const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            date.setMonth(date.getMonth() - 1);
            const lastMonth = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            getGarbageCollectionFromBuilding(building, {
                startDate: new Date(lastMonth),
                endDate: new Date(currentDate),
            })
                .then((res) => {
                    setCollections(res.data);
                    setErrorMessages([]);
                })
                .catch((error) => {
                    setErrorMessages(handleError(error));
                });
        }
    }, [building]);

    function getNewBuildingDateUrl(date: Date) {
        const url = new URL(window.location.href);
        const queryParams = new URLSearchParams(url.search);
        queryParams.set("date", date + "");
        url.search = queryParams.toString();
        return url.toString();
    }

    return (
        <>
            <div style={{ height: "100%", overflowY: "scroll" }}>
                <h1>Recente ophalingen</h1>

                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />

                {collections.length > 0 ? (
                    <ul>
                        {collections.map((collection: GarbageCollectionInterface) => (
                            <li key={collection.id}>
                                <>
                                    Type: {collection.garbage_type} <br />
                                    Datum:&nbsp;
                                    <a href={getNewBuildingDateUrl(new Date(collection.date))}>
                                        {convertToSensibleDateShort(new Date(collection.date))}
                                    </a>
                                    <br />
                                </>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Er zijn geen ophalingen gevonden in de voorbije maand.</p>
                )}
            </div>
        </>
    );
}

export default LatestCollections;
