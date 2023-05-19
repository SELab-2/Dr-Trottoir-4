import React from "react";
import BuildingPage from "@/components/building/BuildingPage";
import BaseHeader from "@/components/header/baseHeader";

function PublicBuilding() {
    return (
        <div className="tablepageContainer">
            <BaseHeader/>
            <div className="tableContainer">
                <BuildingPage type={"public"}/>
            </div>
        </div>
    );
}

export default PublicBuilding;
