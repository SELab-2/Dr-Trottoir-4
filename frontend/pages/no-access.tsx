import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";

export default function NoAccess() {
    return (
        <>
            <>
                <BaseHeader />
                <p className={styles.title}>Deze pagina bestaat niet of je hebt geen toegang.</p>
            </>
        </>
    );
}
