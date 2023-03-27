import BaseHeader from "@/components/header/BaseHeader";

import {verifyToken} from "@/lib/login";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import getUserInfo, {getCurrentUser} from "@/lib/user_info";
import {getRoleDirection} from "@/lib/reroute";
import Loading from "@/components/loading";
import LoginForm from "@/components/loginform";
import setSessionStorage from "@/lib/storage";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

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
                console.error(err);
            }
        )
    }, [getCurrentUser]);

    return (
        <>
            <BaseHeader/>
            <div>{loading ? <Loading/> : <LoginForm/>}</div>
        </>
    );
}
