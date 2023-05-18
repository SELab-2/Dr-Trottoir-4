import {withAuthorisation} from "@/components/withAuthorisation";
import AdminHeader from "@/components/header/adminHeader";
import ManualView from "@/components/manual/ManualView";

function AdminManual() {

    return (
        <>
            <AdminHeader/>

            <ManualView/>

        </>
    );

}

export default withAuthorisation(AdminManual, ["Admin"]);
