import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NoAccess from "./no-access";
import {I18nextProvider} from 'react-i18next';
import i18n from '../i18n';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const [role, setRole] = useState<string>("");


    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    useEffect(() => {
        setRole(sessionStorage.getItem("role") || "Default"); // default role as backup
    }, []);

    console.log(role);

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

    return (
        <I18nextProvider i18n={i18n}>
            <ComponentToRender {...pageProps} />
        </I18nextProvider>
    );
}
