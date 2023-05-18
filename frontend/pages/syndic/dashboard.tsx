import { withAuthorisation } from "@/components/withAuthorisation";
import router from "next/router";
import { BuildingInterface, getBuildingsFromOwner } from "@/lib/building";
import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import SyndicFooter from "@/components/footer/syndicFooter";
import Loading from "@/components/loading";
import SyndicHeader from "@/components/header/syndicHeader";

function SyndicDashboard() {
    const [id, setId] = useState("");
    const [buildings, setBuildings] = useState([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setId(sessionStorage.getItem("id") || "");
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }

        async function fetchBuildings() {
            getBuildingsFromOwner(id)
                .then((buildings: AxiosResponse<any>) => {
                    setBuildings(buildings.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }

        fetchBuildings();
    }, [id]);

    return (
        <>
            <SyndicHeader />
            {loading ? (
                <Loading />
            ) : (
                <div>
                    <h1>Uw gebouwen</h1>

                    <div className="row" style={{ width: "99%", marginLeft: "auto", marginRight: "auto" }}>
                        {buildings
                            .sort((a: BuildingInterface, b: BuildingInterface) => {
                                if (a.city < b.city) return -1;
                                else if (a.city > b.city) return 1;
                                if (a.street < b.street) return -1;
                                else if (a.street > b.street) return 1;
                                if (a.house_number < b.house_number) return -1;
                                else if (a.house_number > b.house_number) return 1;
                                return 0;
                            })
                            .map((building: BuildingInterface) => {
                                return (
                                    <div
                                        className="col-md-4 mb-3 clickable"
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
                </div>
            )}
            <SyndicFooter />
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
