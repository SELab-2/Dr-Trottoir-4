import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";

export default function StudentDashboard() {

    return (
        <>
            <BaseHeader/>
            <p className={styles.title}>This is the default dashboard, you don't have a role yet.</p>
            <Image src={soon} alt="Site coming soon" className={styles.image}/>
            <LogoutButton/>
        </>
    );
}
