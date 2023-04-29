import React from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import SyndicHeader from "@/components/header/syndicHeader";
import SyndicFooter from "@/components/footer/syndicFooter";
import BuildingPage from "@/components/building/BuildingPage";

function SyndicBuilding() {
    // https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1310&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486

    return (
        <>
            <SyndicHeader />

            <BuildingPage type={"syndic"} />

            <SyndicFooter />
        </>
    );
}

export default withAuthorisation(SyndicBuilding, ["Syndic"]);
