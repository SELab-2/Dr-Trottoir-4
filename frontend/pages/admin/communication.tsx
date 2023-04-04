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

    const filteredComments = commentQuery.trim()
    ? allComments.filter(option => 
        option.comment.toLowerCase().includes(commentQuery.toLowerCase()))
    : allComments;

    const handleSelectTemplate = (eventKey: string | null) => {
        setSelectedTemplate(eventKey ? eventKey : "");
        setTemplateQuery("");
    }

    const handleSelectComment = (eventKey: string | null) => {
        setSelectedComment(eventKey ? eventKey : "");
        setCommentQuery("");
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

                <DropdownButton
                    variant="secondary"
                    title={selectedTemplate || 'Kies template'}
                    onSelect={handleSelectTemplate}
                >
                    <>
                        <FormControl
                            autoFocus
                            placeholder="Zoeken..."
                            onChange={e => setTemplateQuery(e.target.value)}
                            value={templateQuery}
                        />
                        <Dropdown.Divider />
                        {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((option: EmailTemplate) => (
                            <Dropdown.Item key={option.name} eventKey={option.name}>
                                {option.name}
                            </Dropdown.Item>
                        ))
                        ) : (
                            <Dropdown.Item disabled>Geen overeenkomende opties gevonden.</Dropdown.Item>
                        )}
                    </>
                </DropdownButton>

                <DropdownButton
                    variant="secondary"
                    title={selectedComment || 'Kies Opmerking'}
                    onSelect={handleSelectComment}
                >
                    <>
                        <FormControl
                            autoFocus
                            placeholder="Zoeken..."
                            onChange={e => setCommentQuery(e.target.value)}
                            value={commentQuery}
                        />
                        <Dropdown.Divider />
                        {filteredComments.length > 0 ? (
                            filteredComments.map((option: BuildingComment) => (
                                <Dropdown.Item key={option.comment} eventKey={option.comment}>
                                    {option.comment}
                                </Dropdown.Item>
                            ))
                        ) : (
                            <Dropdown.Item disabled>Geen overeenkomende opties gevonden.</Dropdown.Item>
                        )}
                    </>
                </DropdownButton>
            </>
        </>
    );
}
