import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import api from "../pages/api/axios";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "@/context/AuthProvider";

function Welcome() {
    let { auth, logoutUser } = useContext(AuthContext);
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // prevents preview welcome page before auth check

    useEffect(() => {
        let present = "auth" in sessionStorage;
        let value = sessionStorage.getItem("auth");
        if (present && value == "true") {
            setLoading(false);
            fetchData();
        } else {
            router.push("/login");
        }
    }, []);

    async function fetchData() {
        try {
            api.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`).then((info) => {
                if (!info.data || info.data.length === 0) {
                    router.push("/login");
                } else {
                    setData(info.data);
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    const handleLogout = async () => {
        try {
            const response = await api.post(`${process.env.NEXT_PUBLIC_API_LOGOUT}`);
            if (response.status === 200) {
                logoutUser();
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
