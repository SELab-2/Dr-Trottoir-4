import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {verifyToken} from "@/lib/login";
import getUserInfo from "@/lib/user_info";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Welcome.module.css";

export default function Redirect() {
    const router = useRouter();
    const [user, setUser] = useState({});
    const [userId, setUserId] = useState("");

    useEffect(() => {
            // fetch the userId
            verifyToken().then(
                async (res) => {
                    setUserId(res.data.id);
                    console.log(userId);
                    await getUserInfo(userId).then(
                        (res2) => {
                            setUser(res2.data);
                            console.log(user);
                        },
                        (err) => {
                            console.log(err);
                        }
                    )
                },
                (err) => {
                    // unauthorized
                    console.error(err);
                });
        }
    );

    return (
        <>
            <>
                <BaseHeader/>
                <p className={styles.title}>Redirect Page</p>
            </>
        </>
    );
}