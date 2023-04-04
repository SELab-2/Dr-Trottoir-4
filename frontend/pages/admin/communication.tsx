import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/communication";
import { useEffect, useState } from "react";
import styles from 'styles/Welcome.module.css';
import { Dropdown, DropdownButton, FormControl } from "react-bootstrap";
import Combobox from "@/components/combobox";


export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedComment, setSelectedComment] = useState("");

    const handleSelectTemplate = (eventKey: string | null) => {
        setSelectedTemplate(eventKey ? eventKey : "");
    }

    const handleSelectComment = (eventKey: string | null) => {
        setSelectedComment(eventKey ? eventKey : "");
    }


    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
        }, err => {
            console.error(err);
        });

        getAllBuildingComments().then(res => {
            const buildingComments : BuildingComment[] = res.data;
            setAllComments(buildingComments);
        }, err => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        setLoading(false);
    }, [allTemplates, allComments, selectedTemplate, selectedComment]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>
                <p>Kies een template:</p>

                <Combobox
                    options={allTemplates.map((option: EmailTemplate) => option.name)}
                    selectedOption={selectedTemplate}
                    onSelect={handleSelectTemplate}
                />

                <Combobox
                    options={allComments.map((option: BuildingComment) => option.comment)}
                    selectedOption={selectedComment}
                    onSelect={handleSelectComment}
                />
            </>
        </>
    );
}
