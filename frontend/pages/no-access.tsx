import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import React from "react";
import Link from "next/link";

export default function NoAccess() {

    return (
        <>
            <BaseHeader/>
            <p className={styles.title}>Deze pagina bestaat niet of je hebt geen toegang.</p>
            <button className={`btn btn-dark btn-lg btn-block`} onClick={() => window.history.go(-2)}>
                Go back
            </button>
            <Link href="/login">Go to login</Link>
        </>
    );
}
