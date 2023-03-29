import React from "react";
import styles from "@/components/header/RoleHeader.module.css";

function Template2Filters() {
    return (
        <>
            <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 1"/>
            <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 2"/>
        </>
    );
}

export default Template2Filters;