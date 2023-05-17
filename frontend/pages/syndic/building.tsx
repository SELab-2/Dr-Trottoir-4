import React from "react";
import { withAuthorisation } from "@/components/withAuthorisation";
import SyndicHeader from "@/components/header/syndicHeader";
import SyndicFooter from "@/components/footer/syndicFooter";
import BuildingPage from "@/components/building/BuildingPage";

function SyndicBuilding() {
    return (
        <>
            <SyndicHeader />
            <BuildingPage type={"syndic"} />
            <SyndicFooter />
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
