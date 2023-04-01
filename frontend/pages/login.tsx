import BaseHeader from "@/components/header/BaseHeader";

import { verifyToken } from "@/lib/login";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import getUserInfo from "@/lib/user_info";
import { getRoleDirection } from "@/lib/reroute";
import Loading from "@/components/loading";
import LoginForm from "@/components/loginform";
import setSessionStorage from "@/lib/storage";
import Image from "next/image";
import filler_image from "@/public/filler_image.png";
import styles from "@/styles/Login.module.css";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    // try and log in to the application using existing refresh token
    useEffect(() => {
        verifyToken().then(
            (res) => {
                const id = res.data.id;
                getUserInfo(id).then(
                    async (info) => {
                        const roleId = info.data.role;
                        setSessionStorage(roleId, info.data.id);
                        const direction = getRoleDirection(roleId, "dashboard");
                        await router.push(direction);
                    },
                    (err) => {
                        console.error(err);
                    }
                );
            },
            (err) => {
                setLoading(false);
                console.error(err);
            }
        );
    }, [verifyToken]);

    return (
        <>
            <BaseHeader />
            <div>{loading ? <Loading /> : (
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col col-xl-10">
                            <div className="card">
                                <div className="row g-0">
                                    <div className="col-md-6 col-lg-5 d-none d-md-block">
                                        <Image src={filler_image} alt="My App Logo" className={styles.filler_image}/>
                                    </div>
                                    <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                        <div className="card-body p-4 p-lg-5 text-black">
                                            <LoginForm/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}</div>
        </>
    );
}
