import styles from "styles/Welcome.module.css";
import { withAuthorisation } from "@/components/withAuthorisation";
import DefaultHeader from "@/components/header/studentHeader";

function DefaultDashboard() {
    return (
        <>
            <DefaultHeader />
            <p className={styles.title}>Dit is het dashboard voor de default rol, u hebt nog geen rol.</p>
        </>
    );
}

export default withAuthorisation(DefaultDashboard, ["Default"]);
