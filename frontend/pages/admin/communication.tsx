import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/communication";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import styles from 'styles/Welcome.module.css';
import { Dropdown, DropdownButton, FormControl } from "react-bootstrap";


export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedComment, setSelectedComment] = useState("");
    const [templateQuery, setTemplateQuery] = useState("");
    const [commentQuery, setCommentQuery] = useState("");

    const filteredTemplates = templateQuery.trim()
    ? allTemplates.filter(option =>
        option.name.toLowerCase().includes(templateQuery.toLowerCase()))
    : allTemplates;

    const handleSelectTemplate = (eventKey: string | null) => {
        setSelectedTemplate(eventKey ? eventKey : "");
        setTemplateQuery("");
    }

    const filteredComments = commentQuery.trim()
    ? allComments.filter(option => 
        option.comment.toLowerCase().includes(commentQuery.toLowerCase()))
    : allComments;


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


                <DropdownButton
                    variant="secondary"
                    title={selectedTemplate || 'Kies template'}
                    onSelect={handleSelectTemplate}
                >
                    <>
                        <FormControl
                            autoFocus
                            placeholder="Search..."
                            onChange={e => setTemplateQuery(e.target.value)}
                            value={templateQuery}
                        />
                        <Dropdown.Divider />
                        {filteredTemplates.map((option: EmailTemplate) => (
                            <Dropdown.Item key={option.name} eventKey={option.name}>
                                {option.name}
                            </Dropdown.Item>
                        ))}
                    </>
                </DropdownButton>
            </>
        </>
    );
}
