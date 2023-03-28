import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";
import { withAuthorisation } from "@/components/with-authorisation";

function SyndicDashboard() {
    return (
        <>
            <BaseHeader />
            <p className={styles.title}>Welcome to the Syndic Dashboard!</p>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1145&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <Image src={soon} alt="Site coming soon" className={styles.image} />
            <LogoutButton />
        </>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
