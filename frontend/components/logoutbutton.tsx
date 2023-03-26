import React from "react";
import styles from "@/styles/Welcome.module.css";
import {logout} from "@/lib/logout";
import {useRouter} from "next/router";

function LogoutButton() {
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
        <button
            className={`btn btn-dark btn-lg btn-block ${styles.button}`}
            onClick={handleLogout}
        >Logout</button>
    );
}

export default LogoutButton;