import {useEffect, useState} from "react";
import {getManualsFromBuilding, ManualInterface} from "@/lib/manual";

function ManualList({id}: { id: number | string }) {


    const [manuals, setManuals] = useState<ManualInterface[]>([]);
    useEffect(() => {
        fetchManuals();
    });

    async function fetchManuals() {

        getManualsFromBuilding(id)
            .then((manuals) => {
                let manuals_data = manuals.data;
                manuals_data.sort((a: ManualInterface, b: ManualInterface) => a.version_number - b.version_number);
                setManuals(manuals_data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <>
            TODO: moet editable zijn voor admins (op de edit page). Syndics moeten de meest recente zien. Residents mogen ze helemaal niet zien
            <ul>
                {manuals.map((manual: ManualInterface) => (
                    <li key={manual.id}>
                        <a href={`/admin/manual?id=${manual.id}`} style={{textDecoration: 'underline', color: 'blue'}}>
                            Versie {manual.version_number}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );

}

export default ManualList;

