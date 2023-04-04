import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/email-template";
import { useEffect, useState, ChangeEvent } from "react";
import styles from 'styles/Welcome.module.css';
import { Dropdown, DropdownButton, FloatingLabel, Form, FormControl } from "react-bootstrap";
import Combobox from "@/components/combobox";
import FileInputField from "@/components/fileInputField";
import { getAllPicturesOfBuilding, PictureBuilding } from "@/lib/picture-building";


export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedComment, setSelectedComment] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState(-1);
    const [allPictures, setAllPictures] = useState<PictureBuilding[]>([]);
    const [templateText, setTemplateText] = useState("");

    const handleSelectTemplate = (eventKey: string | null) => {
        setSelectedTemplate(eventKey ? eventKey : "");
        if (eventKey) {
            const currentTemplate = allTemplates.find(e => e.name.startsWith(eventKey));
            if (currentTemplate) {
                setTemplateText(currentTemplate.template);
            }
        }
        
    }

    const handleSelectComment = (eventKey: string | null) => {
        setSelectedBuilding(-1);

        setSelectedComment(eventKey ? eventKey : "");
        if (eventKey) {
            const currentComment = allComments.find(e => e.comment.startsWith(eventKey));
            if (currentComment) {
                setSelectedBuilding(currentComment.building);
                getAllPicturesOfBuilding(currentComment.building).then(res => {
                    const buildingPictures : PictureBuilding[] = res.data;
                    setAllPictures(buildingPictures);
                    console.log(buildingPictures);
                }, err => {
                    console.error(err);
                });
            }
        }
    }

    const handleUpload = (files: FileList) => {
        console.log(files);
    }

    const handleEditTemplate = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setTemplateText(event.target.value);
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
        //console.log(allComments);
    }, [allTemplates, allComments, selectedTemplate, selectedComment]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>
                <p className={styles.text}>Kies een template:</p>
                <div style={{ display: 'flex' }}>
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
                </div>
                <div style={{ display: 'flex' }}>
                <FloatingLabel
                    controlId="floatingTextarea"
                    label="Email"
                    className="mb-3"
                    style={{ width: "80%" }}
                >
                    <Form.Control 
                    as="textarea" 
                    placeholder="Write your email here"
                    style={{ height: '400px' }} 
                    value={templateText}
                    onChange={handleEditTemplate}
                    />
                </FloatingLabel>
                <FileInputField onUpload={handleUpload}/>
                </div>
            </>
        </>
    );
}
