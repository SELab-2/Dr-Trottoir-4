import { GarbageCollectionInterface, getGarbageCollectionFromBuilding } from "@/lib/garbage-collection";
import { useEffect, useState } from "react";
import { BuildingInterface } from "@/lib/building";

function LatestCollections({ building }: { building: number }) {
    const [collections, setCollections] = useState<GarbageCollectionInterface[]>([]);

    useEffect(() => {
        console.log(`Building id is ${building}`);
        if (building) {
            getGarbageCollectionFromBuilding(building)
                .then((res) => {
                    console.log(JSON.stringify(res.data));
                    setCollections(res.data);
                })
                .catch((error) => {
                    //TODO: generieke functie nodig voor error messages
                    //  De error message zou dan kunnen pop uppen in een modal
                    console.error(error);
                });
        }
    }, [building]);

    return (
        <div style={{ height: "100%", overflowY: "scroll" }}>
            <h1>Latest Collections (TODO: werken met query params en bv gwn de laatste maand opvragen)</h1>
            <ul>
                {collections.map((collection: GarbageCollectionInterface) => (
                    <li key={collection.id}>
                        <>
                            Type: {collection.garbage_type} <br />
                            Datum: {collection.date}
                            <br />
                        </>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LatestCollections;
