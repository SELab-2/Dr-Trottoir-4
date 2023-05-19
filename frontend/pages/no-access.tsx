import BaseHeader from "@/components/header/baseHeader";
import React from "react";
import Link from "next/link";

export default function NoAccess() {
    return (
        <>
            <BaseHeader />
            <p className="title">Deze pagina bestaat niet of je hebt geen toegang.</p>
            <Link href="/login">Go to login</Link>
        </>
    );
}
