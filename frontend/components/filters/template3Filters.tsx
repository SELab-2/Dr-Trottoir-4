import React from "react";
import styles from "@/components/header/roleHeader.module.css";

function Template3Filters() {
    return (
        <>
            <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 1"/>
            <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 2"/>
            <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 3"/>
        </>
    );
}

export default Template3Filters;