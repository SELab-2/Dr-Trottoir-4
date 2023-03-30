import BaseHeader from "@/components/header/BaseHeader";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/communication";
import { Dropdown } from "bootstrap";
import { useEffect, useState } from "react";
import styles from "styles/Welcome.module.css";

export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [emailContent, setEmailContent] = useState("");
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    
    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
        }, err => {
            console.error(err);
        }
        );
    }, []);


    return (
        <>
            <>
                <BaseHeader />
                <p className={styles.title}>Communicatie extern</p>
                <h1 className={styles.text}>Templates:</h1>
                    <ul>
                        {allTemplates.map((item, index) => (
                            <li key={index}>{JSON.stringify(item)}</li>
                        ))}
                    </ul>
            </>
        </>
    );
}
