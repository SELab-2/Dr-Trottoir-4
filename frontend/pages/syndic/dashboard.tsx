import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import { useRouter } from "next/router";
import { logout } from "@/lib/logout";

export default function SyndicDashboard() {
    const router = useRouter();


    const handleLogout = () => {
        logout().then(
            async (res) => {
                if (res.status === 200) {
                    sessionStorage.removeItem("id");
                    sessionStorage.removeItem("role");
                    await router.push("/login");
                }
            },
            (err) => {
                console.error(err);
            }
        );
    };

    return (
        <>
            <>
                <BaseHeader/>
                <p className={styles.title}>Welcome to the Syndic Dashboard!</p>
                <p>https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=16-1145&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486</p>
                <Image src={soon} alt="Site coming soon" className={styles.image}/>
                <button className={styles.button} onClick={handleLogout}>
                    Logout
                </button>
            </>
        </>
    );
}
