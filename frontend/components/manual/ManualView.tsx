import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getManual} from "@/lib/manual";
import {AxiosResponse} from "axios";


interface ManualQuery {
    id?: string;
}

function ManualView() {
    const router = useRouter();
    const query = router.query as ManualQuery;

    const [file, setFile] = useState<string>("");

    useEffect(() => {
        if (!query.id) {
            return;
        }
        fetchManual();
    }, [query.id]);

    async function fetchManual() {
        if (!query.id) {
            return;
        }
        getManual(Number(query.id))
            .then((manual: AxiosResponse) => {
                setFile(`${process.env.NEXT_PUBLIC_BASE_API_URL}${manual.data.file.slice(1)}`);
            })
            .catch((error) => {
                //TODO: error component
                console.error(error);
            });
    }


    return (
        <>
            {!file ? (
                <p>Kon de handleiding niet laden</p>
            ) : (
                <div style={{
                    height: "88vh",
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: ".5%"
                }}>
                    <embed src={file} style={{width: "97%"}}/>
                </div>
            )}
        </>
    );

}

export default ManualView;
