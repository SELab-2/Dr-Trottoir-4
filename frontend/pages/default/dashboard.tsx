import styles from "styles/Welcome.module.css";
import { withAuthorisation } from "@/components/withAuthorisation";
import DefaultHeader from "@/components/header/defaultHeader";

function DefaultDashboard() {
    return (
        <>
            <DefaultHeader />
            <p className={styles.title}>This is the default dashboard, you don't have a role yet.</p>
        </>
    );
}

export default withAuthorisation(DefaultDashboard, ["Default"]);
