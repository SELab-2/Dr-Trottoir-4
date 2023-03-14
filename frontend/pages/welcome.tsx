import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import api from "../pages/api/axios"
import {useEffect, useState} from "react";
import {useRouter} from "next/router";

function Welcome() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get('/data');
                setData(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const router = useRouter();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!data || data.length === 0) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <BaseHeader/>
            <p className={styles.title}>Welcome!</p>
            <Image src={soon} alt="Site coming soon" className={styles.image}/>
            <h1 className={styles.text}>Users:</h1>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </>
    )


}

export default Welcome