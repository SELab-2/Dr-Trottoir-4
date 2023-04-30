import React from "react";
import BuildingPage from "@/components/building/BuildingPage";
import BaseHeader from "@/components/header/baseHeader";

function PublicBuilding() {
    return (
        <>
            <BaseHeader />
            <BuildingPage type={""} />
        </>
    );
}

export default PublicBuilding;
