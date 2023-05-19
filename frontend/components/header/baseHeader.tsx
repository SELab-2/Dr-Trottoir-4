import React from "react";
import Image from "next/image";
import logo from "../../public/logo.png";
import styles from "./baseHeader.module.css";
import {Navbar} from "react-bootstrap";

const BaseHeader = () => {
    return (
        <Navbar className={styles.container}>
            <div className={styles.logo}>
                <Image src={logo} alt="My App Logo" width={120} height={30} />
            </div>
        </Navbar>
    );
};

export default BaseHeader;
