import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import api from "../pages/api/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function Welcome() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // prevents preview welcome page before auth check

    useEffect(() => {
        setData([]);
        fetchData();
    }, []);

    async function fetchData() {
        api.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`).then(
            (info) => {
                // Set loading to false only if the response is valid
                setLoading(false);
                setData(info.data);
            },
            (err) => {
                console.error(err);
                if (err.response.status == 401) {
                    router.push("/login"); // Only redirect to login if the status code is 401: unauthorized
                }
            }
        );
    }

    const handleLogout = async () => {
        try {
            const response = await api.post(`${process.env.NEXT_PUBLIC_API_LOGOUT}`);
            if (response.status === 200) {
                await router.push("/login");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <BaseHeader />
                    <p className={styles.title}>Welcome!</p>
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
                </>
            )}
        </>
    );
}

export default Welcome;
