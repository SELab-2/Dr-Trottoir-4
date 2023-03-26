import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";
import {withAuthorisation} from "@/components/withAuthorisation";

function SyndicDashboard() {

    return (
        <>
            <BaseHeader/>
            <p className={styles.title}>Welcome to the Syndic Dashboard!</p>
            <Image src={soon} alt="Site coming soon" className={styles.image}/>
            <LogoutButton/>
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
