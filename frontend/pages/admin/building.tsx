import AdminHeader from "@/components/header/adminHeader";
import BuildingPage from "@/components/building/BuildingPage";
import React from "react";
import {withAuthorisation} from "@/components/withAuthorisation";

function AdminBuilding() {
    return (
        <div className="tablepageContainer">
            <AdminHeader/>
            <div className="tableContainer">
                <BuildingPage type={"admin"}/>
            </div>
        </div>
    );
}

export default withAuthorisation(AdminBuilding, ["Admin", "Superstudent"]);
