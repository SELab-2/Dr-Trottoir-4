import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { logout } from "@/lib/logout";
import { getAllUsers } from "@/lib/welcome";

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // prevents preview welcome page before auth check

    useEffect(() => {
        setData([]);
        fetchData();
    }, []);

    async function fetchData() {
        getAllUsers().then(
            (res) => {
                // Set loading to false only if the response is valid
                setLoading(false);
                setData(res.data);
            },
            (err) => {
                console.error(err);
                if (!err.response || err.response.status == 401) {
                    router.push("/login"); // Only redirect to login if the status code is 401: unauthorized
                }
            }
        );
    }

    const handleLogout = async () => {
        logout().then(
            async (res) => {
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
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <BaseHeader/>
                    <p className={styles.title}>Welcome to the Admin Dashboard!</p>
                    <Image src={soon} alt="Site coming soon" className={styles.image}/>
                    <button className={styles.button} onClick={handleLogout}>
                        Logout
                    </button>
                    <h1 className={styles.text}>Users:</h1>
                    <ul>
                        {data.map((item, index) => (
                            <li key={index}>{JSON.stringify(item)}</li>
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}
