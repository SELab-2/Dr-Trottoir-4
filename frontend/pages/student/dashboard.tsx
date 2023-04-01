import StudentHeader from "@/components/header/StudentHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import LogoutButton from "@/components/logoutbutton";
import { withAuthorisation } from "@/components/withAuthorisation";

function StudentDashboard() {
    return (
        <>
            <StudentHeader />
            <p className={styles.title}>Welcome to the Student Dashboard!</p>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=32-29&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
            <Image src={soon} alt="Site coming soon" className={styles.image} />
            <LogoutButton />
        </>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
