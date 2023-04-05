import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/email-template";
import { useEffect, useState, ChangeEvent } from "react";
import styles from 'styles/Welcome.module.css';
import { Dropdown, DropdownButton, FloatingLabel, Form, FormControl } from "react-bootstrap";
import Combobox from "@/components/combobox";
import FileInputField from "@/components/fileInputField";
import { getAllPicturesOfBuilding, PictureBuilding } from "@/lib/picture-building";
import PhotoSelector from "@/components/scrollViewPicture";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import { getAllUsers, User } from "@/lib/user";
import SyndicAutoCompleteComponent from "@/components/autocompleteComponents/syndicAutoCompleteComponent";
import { width } from "@mui/system";


export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [allPictures, setAllPictures] = useState<PictureBuilding[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [allSyndics, setAllSyndics] = useState<User[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedSyndic, setSelectedSyndic] = useState("");
    
    const [templateText, setTemplateText] = useState("");
    const [selectedPictures, setSelectedPictures] = useState<string[]>([]);
    const [templateId, setTemplateId] = useState("");
    const [commentId, setCommentId] = useState("");
    const [syndicId, setSyndicId] = useState("");

    const handleSelectTemplate = (eventKey: string | null) => {
        setSelectedTemplate(eventKey ? eventKey : "");
        if (eventKey) {
            const currentTemplate = allTemplates.find(e => e.name.startsWith(eventKey));
            if (currentTemplate) {
                setTemplateText(currentTemplate.template);
            }
        }
        
    }

    // const handleSelectComment = (eventKey: string | null) => {
    //     setSelectedBuilding(-1);

    //     setSelectedComment(eventKey ? eventKey : "");
    //     if (eventKey) {
    //         const currentComment = allComments.find(e => e.comment.startsWith(eventKey));
    //         if (currentComment) {
    //             setSelectedBuilding(currentComment.building);
    //             getAllPicturesOfBuilding(currentComment.building).then(res => {
    //                 const buildingPictures : PictureBuilding[] = res.data;
    //                 setAllPictures(buildingPictures);
    //                 console.log(buildingPictures);
    //             }, err => {
    //                 console.error(err);
    //             });
    //         }
    //     }
    // }

    const handlePictureSelectionChange = (selectedPhotos: string[]) => {
        setSelectedPictures(selectedPhotos);
    }
    

    const handleEditTemplate = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setTemplateText(event.target.value);
    }


    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
            // setSelectedTemplate(emailTemplates[0].name);
        }, err => {
            console.error(err);
        });

        getAllBuildingComments().then(res => {
            const buildingComments : BuildingComment[] = res.data;
            setAllComments(buildingComments);
        }, err => {
            console.error(err);
        });

        getAllBuildings().then(res => {
            const buildings : BuildingInterface[] = res.data;
            setAllBuildings(buildings);
            setSelectedBuilding(buildings[0].name);
        });

        getAllUsers().then(res => {
            const users : User[] = res.data;
            setAllSyndics(users.filter(e => e.role == 2));
            // setSelectedSyndic(allSyndics[0].first_name); // TODO edit
        });
    }, []);

    useEffect(() => {
        setLoading(false);
    }, [allTemplates, allComments, selectedTemplate]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>
                <p className={styles.text}>Kies een template:</p>
                <div style={{ display: 'flex', width:"100%"  }}>
                    <div style={{ width: "40%" }}>
                        <TemplateAutocomplete
                            value={selectedTemplate}
                            onChange={setSelectedTemplate}
                            setObjectId={setTemplateId}
                            required={false}
                        ></TemplateAutocomplete>
                    </div>
                    <div style={{ width: "40%" }}>
                        <SyndicAutoCompleteComponent
                            value={selectedSyndic}
                            onChange={setSelectedSyndic}
                            setObjectId={setSyndicId}
                            required={true}
                        ></SyndicAutoCompleteComponent>
                    </div>
                    
                
                </div>
                <div style={{ display: 'flex'}}>
                    <FloatingLabel
                        controlId="floatingTextarea"
                        label="Email"
                        className="mb-3"
                        style={{ width: "70%" }}
                    >
                        <Form.Control 
                        as="textarea" 
                        placeholder="Schrijf je email hier"
                        style={{ height: '400px' }} 
                        value={templateText}
                        onChange={handleEditTemplate}
                        />
                    </FloatingLabel>
                    <div style={{ width: "30%" }}>
                    <label className={styles.text}>Eventuele foto's opmerking:</label>
                    <PhotoSelector
                        photos={allPictures.length > 0 ? (
                            allPictures.map(e => e.picture)
                        ) : (
                            ["https://www.pulsecarshalton.co.uk/wp-content/uploads/2016/08/jk-placeholder-image.jpg"]
                        )}
                        onSelectionChange={handlePictureSelectionChange}
                    />
                    </div>
                </div>
            </>
        </>
    );
}
