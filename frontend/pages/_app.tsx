import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserRole } from "@/lib/user_info";
import NoAccess from "./no-access";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const [role, setRole] = useState<string>("");


    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
        
        setRole(sessionStorage.getItem("role") || "Default"); // default role as backup
        // const roleId = sessionStorage.getItem("role") || "Default"; // default role as backup
        // fetchUserRole(roleId);

    }, []);

    // async function fetchUserRole(roleId: string) {
    //     getUserRole(roleId).then(
    //         (res) => {
    //             setRole(res.data.name);
    //         },
    //         (err) => {
    //             console.error(err);
    //         }
    //     )
    // }

    let allowed = true;

    if (router.pathname.startsWith("/admin") && !(role == "Admin" || role == "Superstudent")) {
        allowed = false;
    }

    if (router.pathname.startsWith("/student") && role !== "Student") {
        allowed = false;
    }

    if (router.pathname.startsWith("/syndic") && role !== "Syndic") {
        allowed = false;
    }
    
    const ComponentToRender = allowed ? Component : NoAccess; 

    return <ComponentToRender {...pageProps} />;
}
