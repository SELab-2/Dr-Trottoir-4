import BaseHeader from "@/components/header/BaseHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/communication";
import { Fragment, useEffect, useState } from "react";
import styles from "styles/Welcome.module.css";
import { Combobox, Transition } from '@headlessui/react'

export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState({});
    const [selectedComment, setSelectedComment] = useState({});
    const [templateQuery, setTemplateQuery] = useState("");
    const [commentQuery, setCommentQuery] = useState("");
    
    const filteredTemplates =
        templateQuery === "" 
            ? allTemplates
            : allTemplates.filter((template) => {
                template.name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(templateQuery.toLowerCase().replace(/\s+/g, ""));
            });
    const filteredComments = 
        commentQuery === "" 
            ? allComments
            : allComments.filter((comment) => {
                comment.comment
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(commentQuery.toLowerCase().replace(/\s+/g, ""));
            });

    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
            setSelectedTemplate({id: allTemplates[0].id, name: allTemplates[0].name});
        }, err => {
            console.error(err);
        });

        getAllBuildingComments().then(res => {
            const buildingComments : BuildingComment[] = res.data;
            setAllComments(buildingComments);
            setSelectedComment({id: allComments[0], name: allComments[0].comment});
        }, err => {
            console.error(err);
        });



    }, []);


    return (
        <>
            <>
                <BaseHeader />
                <p className={styles.title}>Communicatie extern</p>
                <Combobox value={selectedTemplate} onChange={setSelectedTemplate}>
                    <div>
                        <div>
                        <Combobox.Input
                            displayValue={(template: EmailTemplate) => template.name}
                            onChange={(event) => setTemplateQuery(event.target.value)}
                        />
                        <Combobox.Button>

                        </Combobox.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setTemplateQuery("")}
                            >
                                <Combobox.Options>
                                    
                                </Combobox.Options>
                        </Transition>
                    </div>
                    
                </Combobox>
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
