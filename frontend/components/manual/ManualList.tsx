import {useEffect, useState} from "react";
import {getManualsForBuilding, ManualInterface} from "@/lib/building-manual";

function ManualList({id, type}: { id: number | string; type: "syndic" | "admin" | "public" }) {
    const [manuals, setManuals] = useState<ManualInterface[]>([]);

    useEffect(() => {
        fetchManuals();
    });

    async function fetchManuals() {
        if (type == "public") {
            return;
        }

        getManualsForBuilding(id)
            .then((manuals) => {
                let manuals_data = manuals.data;
                manuals_data.sort((a: ManualInterface, b: ManualInterface) => b.version_number - a.version_number);

                if (type == "syndic" && manuals_data.length > 0) {
                    setManuals([manuals_data[0]]);
                } else {
                    setManuals(manuals_data);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <>
            {manuals && manuals.length > 0 ? (
                <ul>
                    {manuals.map((manual: ManualInterface) => (
                        <li key={manual.id}>
                            <a
                                href={`/${type}/manual?id=${manual.id}`}
                                style={{textDecoration: "underline", color: "blue"}}
                            >
                                Versie {manual.version_number}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Er zijn geen handleidingen voor dit gebouw</p>
            )}
        </>
    );
}

export default ManualList;
