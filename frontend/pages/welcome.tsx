import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";

function Welcome() {
    return (
            <>
                <BaseHeader/>
                <p className={styles.title}>Welcome!</p>
                <Image src={soon} alt="Site coming soon" className={styles.image}/>
            </>
    )
}

export default Welcome