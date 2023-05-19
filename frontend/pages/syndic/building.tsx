import React from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import SyndicHeader from "@/components/header/syndicHeader";
import SyndicFooter from "@/components/footer/syndicFooter";
import BuildingPage from "@/components/building/BuildingPage";

function SyndicBuilding() {
    return (
        <div className="tablepageContainer">
            <SyndicHeader/>
            <div className="tableContainer">
                <BuildingPage type={"syndic"}/>
            </div>
            <SyndicFooter/>
        </div>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
