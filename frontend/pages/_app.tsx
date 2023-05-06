import "bootstrap/dist/css/bootstrap.min.css";
import "styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return (
        <I18nextProvider i18n={i18n}>
            <Component {...pageProps} />
        </I18nextProvider>
    );
}
