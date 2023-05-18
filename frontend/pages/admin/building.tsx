import AdminHeader from "@/components/header/adminHeader";
import BuildingPage from "@/components/building/BuildingPage";
import React from "react";
import { withAuthorisation } from "@/components/withAuthorisation";

function AdminBuilding() {
    // https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=7-114&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486

    return (
        <>
            <>
                <AdminHeader />

                <BuildingPage type={"admin"} />
            </>
        </>
    );
}

export default withAuthorisation(AdminBuilding, ["Admin", "Superstudent"]);
