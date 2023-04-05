import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/email-template";
import { useEffect, useState, ChangeEvent } from "react";
import styles from 'styles/Welcome.module.css';
import { Dropdown, DropdownButton, FloatingLabel, Form, FormControl } from "react-bootstrap";
import { getAllPicturesOfBuilding, PictureBuilding } from "@/lib/picture-building";
import PhotoSelector from "@/components/scrollViewPicture";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import { getAllUsers, User, userSearchString } from "@/lib/user";
import SyndicAutoCompleteComponent from "@/components/autocompleteComponents/syndicAutoCompleteComponent";


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

    const handleSelectSyndic = (eventKey: string | null) => {
        setSelectedSyndic(eventKey ? eventKey : "");
        if (eventKey) {
            console.log(syndicId);
           
            const currentBuilding = allBuildings.find(e => e.syndic === Number(syndicId));
            console.log(currentBuilding);
        }
    }

    const handlePictureSelectionChange = (selectedPhotos: string[]) => {
        setSelectedPictures(selectedPhotos);
    }
    
    const replaceVariable = (str: string, variable: string, value: string) : string => {
        const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
        return str.replace(regex, value);
    }

    const fillInVariables = (input: string) : string => {
         const currentSyndic = allSyndics.find(e => e.id === Number(syndicId));
        if (currentSyndic) {
            const currentBuilding = allBuildings.find(e => e.syndic === currentSyndic.id);

            const replacedName = replaceVariable(input, 'name', 
                currentSyndic.first_name + " " + currentSyndic.last_name
            );
            if (currentBuilding) {
                const replacedAddress = replaceVariable(replacedName, 'address', currentBuilding.city);
                return replacedAddress;
            }
        }

        return input;
    }

    const handleEditTemplate = (event: ChangeEvent<HTMLTextAreaElement>) => {
            const changedVariablesText = fillInVariables(event.target.value);
            setTemplateText(withVariables);
    }

    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
            setSelectedTemplate(emailTemplates[0].name);
            setTemplateText(emailTemplates[0].template);
        }, err => {
            console.error(err);
        });

        getAllBuildingComments().then(res => {
            const buildingComments : BuildingComment[] = res.data;
            setAllComments(buildingComments);
        }, err => {
            console.error(err);
        });

         // change this to getAllSyndics when it's available
         getAllUsers().then(res => {
            const users : User[] = res.data;
            setAllSyndics(users);
            setSelectedSyndic(userSearchString(users[0]));
            setSyndicId(users[0].id.toString());
        });

        getAllBuildings().then(res => {
            const buildings : BuildingInterface[] = res.data;
            setAllBuildings(buildings);
        });
    }, []);

    useEffect(() => {
        setLoading(false);
        const currentBuilding = allBuildings.find(e => e.syndic === Number(syndicId));
        setSelectedBuilding(currentBuilding ? currentBuilding.name : "");
        console.log(syndicId);
        const changedVariablesText = fillInVariables(templateText);
        setTemplateText(changedVariablesText);
    }, [allTemplates, allComments, allSyndics, allBuildings, selectedTemplate, selectedSyndic, templateText]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>
                <p className={styles.text}>Kies een template:</p>
                <div style={{ display: 'flex', width:"100%"  }}>
                    <div style={{ width: "35%" }}>
                        <TemplateAutocomplete
                            value={selectedTemplate}
                            onChange={handleSelectTemplate}
                            setObjectId={setTemplateId}
                            required={false}
                        ></TemplateAutocomplete>
                    </div>
                    <div style={{ width: "35%" }}>
                        <SyndicAutoCompleteComponent
                            value={selectedSyndic}
                            onChange={handleSelectSyndic}
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
