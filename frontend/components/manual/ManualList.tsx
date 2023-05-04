import {useEffect, useState} from "react";
import {getManualsFromBuilding, ManualInterface} from "@/lib/manual";

function ManualList({id, type}: { id: number | string, type: "syndic" | "admin" | "public" }) {


    const [manuals, setManuals] = useState<ManualInterface[]>([]);

    useEffect(() => {
        fetchManuals();
    });

    async function fetchManuals() {
        if (type == "public") {
            return
        }

        getManualsFromBuilding(id)
            .then((manuals) => {
                let manuals_data = manuals.data;
                manuals_data.sort((a: ManualInterface, b: ManualInterface) => a.version_number - b.version_number);

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
            TODO: moet editable zijn voor admins (op de edit page). Syndics moeten de meest recente zien. Residents
            mogen ze helemaal niet zien

            {
                manuals && manuals.length > 0 ? (
                    <ul>
                        {manuals.map((manual: ManualInterface) => (
                            <li key={manual.id}>
                                <a href={`/${type}/manual?id=${manual.id}`} style={{textDecoration: 'underline', color: 'blue'}}>
                                    Versie {manual.version_number}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Er zijn geen handleidingen voor dit gebouw</p>
                )
            }

        </>
    );

}

export default ManualList;

