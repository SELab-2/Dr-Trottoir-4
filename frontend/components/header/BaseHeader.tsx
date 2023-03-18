import React from "react";
import Image from "next/image";
import logo from "../../public/logo.png";
import styles from "./BaseHeader.module.css";

const BaseHeader = () => {
  return (
    <header className={styles.container}>
      <div className={styles.logo}>
        <Image src={logo} alt="My App Logo" width={120} height={30} />
      </div>
    </header>
  );
};

export default BaseHeader;
