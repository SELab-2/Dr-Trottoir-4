import {withAuthorisation} from "@/components/withAuthorisation";
import ManualView from "@/components/manual/ManualView";
import SyndicHeader from "@/components/header/syndicHeader";
import SyndicFooter from "@/components/footer/syndicFooter";

function SyndicManual() {

    return (
        <>

            <SyndicHeader/>
            <ManualView/>
            <SyndicFooter/>

        </>
    );

}

export default withAuthorisation(SyndicManual, ["Syndic"]);
