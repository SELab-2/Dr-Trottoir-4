import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { logout } from "@/lib/logout";

export default function StudentDashboard() {
    const router = useRouter();


    const handleLogout = async () => {
        logout().then(
            async (res) => {
                sessionStorage.removeItem("id");
                sessionStorage.removeItem("role");
                if (res.status === 200) {
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
                <p className={styles.title}>Welcome to the Student Dashboard!</p>
                <Image src={soon} alt="Site coming soon" className={styles.image}/>
                <button className={styles.button} onClick={handleLogout}>
                    Logout
                </button>
            </>
        </>
    );
}
