import BaseHeader from "@/components/header/baseHeader";

import { verifyToken } from "@/lib/login";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import getUserInfo from "@/lib/user_info";
import { getRoleDirection } from "@/lib/reroute";
import Loading from "@/components/loading";
import LoginForm from "@/components/loginForm";
import setSessionStorage from "@/lib/storage";

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
            <div>{loading ? <Loading /> : <LoginForm />}</div>
        </>
    );
}
