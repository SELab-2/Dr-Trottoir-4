import { withAuthorisation } from "@/components/withAuthorisation";
import router from "next/router";
import { BuildingInterface, getBuildingsFromOwner } from "@/lib/building";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import SyndicHeader from "@/components/header/syndicHeader";

function SyndicDashboard() {
    const [id, setId] = useState("");
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        setId(sessionStorage.getItem("id") || "");
    }, []);

    useEffect(() => {
        console.log("hier");

        if (!id) {
            console.log(`nog geen id ${id}`);
            return;
        }

        console.log(`id is ${id}`);

        async function fetchBuildings() {
            getBuildingsFromOwner(id)
                .then((buildings: AxiosResponse<any>) => {
                    setBuildings(buildings.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        fetchBuildings();
    }, [id]);

    if (!id || !buildings) {
        //TODO: loading component, how to use? Maybe with a wrappen and a state boolean?
        return <div>loading...</div>;
    }

    return (
        <>
            <SyndicHeader/>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1145&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <h1>Uw gebouwen</h1>

            <div className="row">
                {buildings.map((building: BuildingInterface) => {
                    // console.log(building);
                    return (
                        <div
                            className="col-md-4 mb-3"
                            key={building.id}
                            onClick={(e) => {
                                e.preventDefault();
                                router.push({
                                    pathname: "building",
                                    query: { id: building.id },
                                });
                            }}
                        >
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {building.name} {building.postal_code} {building.city}
                                    </h5>
                                    <p className="card-text">
                                        {building.street} {building.house_number}{" "}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
