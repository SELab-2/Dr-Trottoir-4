import {GarbageCollectionInterface, getGarbageCollectionFromBuilding} from "@/lib/garbage-collection";
import {useEffect, useState} from "react";

function LatestCollections({building}: { building: number }) {
    const [collections, setCollections] = useState<GarbageCollectionInterface[]>([]);

    useEffect(() => {
        if (building) {
            const date = new Date();
            const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            date.setMonth(date.getMonth() - 1);
            const lastMonth = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

            getGarbageCollectionFromBuilding(building, lastMonth, currentDate)
                .then((res) => {
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
        <div style={{height: "100%", overflowY: "scroll"}}>
            <h1>Recente ophalingen</h1>
            {collections.length > 0 ? (
                <ul>
                    {collections.map((collection: GarbageCollectionInterface) => (
                        <li key={collection.id}>
                            <>
                                Type: {collection.garbage_type} <br/>
                                Datum: {collection.date}
                                <br/>
                            </>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Er zijn geen ophalingen gevonden in de voorbije maand.</p>
            )
            }
        </div>
    );
}

export default LatestCollections;
