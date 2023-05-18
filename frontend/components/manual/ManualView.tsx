import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { getManual } from "@/lib/building-manual";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

interface ManualQuery {
    id?: string;
}

function ManualView() {
    const router = useRouter();
    const query = router.query as ManualQuery;

    const [file, setFile] = useState<string>("");

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
                const file = `${process.env.NEXT_PUBLIC_BASE_API_URL}${manual.data.file.slice(1)}`;
                setFile(file);
                // console.log(file)
                setErrorMessages([]);
            })
            .catch((error) => {
                setErrorMessages(handleError(error));
            });
    }

    return (
        <>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />

            {!file ? (
                <p>Kon de handleiding niet laden</p>
            ) : (
                <div
                    style={{
                        height: "88vh",
                        width: "100vw",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: ".5%",
                    }}
                >
                    <embed src={file} style={{ width: "97%" }} />
                </div>
            )}
        </>
    );
}

export default ManualView;
