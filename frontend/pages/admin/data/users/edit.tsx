import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/user";
import { useRouter } from "next/router";

interface ParsedUrlQuery {}

interface UserEditQuery extends ParsedUrlQuery {
    user?: number;
}

export default function AdminUserEdit() {
    const router = useRouter();
    const query: UserEditQuery = router.query as UserEditQuery;
    const [userData, setUserData] = useState<Object>();

    useEffect(() => {
        if (!query.user) {
            return;
        }
        getUserInfo(query.user.toString()).then((res) => {
            setUserData(res.data);
        });
    }, [router.isReady]);

    return <p>{JSON.stringify(userData)}</p>;
}
