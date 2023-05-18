import BaseHeader from "@/components/header/baseHeader";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getRoleDirection} from "@/lib/reroute";
import Loading from "@/components/loading";
import LoginForm from "@/components/loginForm";
import setSessionStorage from "@/lib/storage";
import Image from "next/image";
import filler_image from "@/public/filler_image.png";
import styles from "@/styles/Login.module.css";
import {getCurrentUser} from "@/lib/user";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // try and log in to the application using existing refresh token
    useEffect(() => {
        getCurrentUser().then(
            async (res) => {
                const user = res.data;
                const roleId = user.role;
                setSessionStorage(roleId, user.id);
                const direction = getRoleDirection(roleId, "dashboard");
                await router.push(direction);
            },
            (err) => {
                setLoading(false);
                setErrorMessages(handleError(err));
            }
        );
    }, [getCurrentUser]);

    return (
        <>
            <BaseHeader/>
            <div>
                {loading ? (
                    <Loading/>
                ) : (
                    <>
                        <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages}/>
                        <div className="container py-5 h-100">
                            <div className="row d-flex justify-content-center align-items-center h-100">
                                <div className="col col-xl-10">
                                    <div className="card">
                                        <div className="row g-0">
                                            <div className="col-md-6 col-lg-5 d-none d-md-block">
                                                <Image
                                                    src={filler_image}
                                                    alt="My App Logo"
                                                    className={styles.filler_image}
                                                />
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
                    </>
                )}
            </div>
        </>
    );
}
