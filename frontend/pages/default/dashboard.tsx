import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import { withAuthorisation } from "@/components/withAuthorisation";
import DefaultHeader from "@/components/header/studentHeader";

function DefaultDashboard() {
    return (
        <>
            <DefaultHeader />
            <p className={styles.title}>This is the default dashboard, you don't have a role yet.</p>
            <Image src={soon} alt="Site coming soon" className={styles.image} />
        </>
    );
}

export default withAuthorisation(DefaultDashboard, ["Default"]);
