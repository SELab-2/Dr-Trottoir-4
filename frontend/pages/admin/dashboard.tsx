import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { logout } from "@/lib/logout";
import { getAllUsers } from "@/lib/welcome";
import Loading from "@/components/loading";

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // prevents preview welcome page before auth check

    useEffect(() => {
        setData([]);
        setLoading(true);
        getAllUsers().then(
            (res) => {
                // Set loading to false only if the response is valid
                setLoading(false);
                setData(res.data);
            },
            async (err) => {
                console.error(err);
                if (!err.response || err.response.status == 401) {
                    await router.push("/login"); // Only redirect to login if the status code is 401: unauthorized
                }
            }
        );
    }, []);

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
            <BaseHeader />
            <div>
                {loading ? (
                    <Loading></Loading>
                ) : (
                    <div>
                        <p className={styles.title}>Welcome to the Admin Dashboard!</p>
                        <p>
                            https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=7-111&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
                        </p>
                        <Image src={soon} alt="Site coming soon" className={styles.image} />
                        <button className={styles.button} onClick={handleLogout}>
                            Logout
                        </button>
                        <h1 className={styles.text}>Users:</h1>
                        <ul>
                            {data.map((item, index) => (
                                <li key={index}>{JSON.stringify(item)}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
