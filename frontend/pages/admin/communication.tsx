import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/email-template";
import { useEffect, useState, ChangeEvent } from "react";
import styles from 'styles/Welcome.module.css';
import { Button, Dropdown, DropdownButton, FloatingLabel, Form, FormControl, Offcanvas } from "react-bootstrap";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import { getAllUsers, User, userSearchString } from "@/lib/user";
import SyndicAutoCompleteComponent from "@/components/autocompleteComponents/syndicAutoCompleteComponent";
import router, { useRouter } from "next/router";

interface ParsedUrlQuery {}

interface DataCommunicationQuery extends ParsedUrlQuery {
    template?: number;
}

export default function AdminCommunication() {
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [allSyndics, setAllSyndics] = useState<User[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedSyndic, setSelectedSyndic] = useState("");
    
    const [templateText, setTemplateText] = useState("");
    const [updatedTemplateText, setUpdatedTemplateText] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [syndicId, setSyndicId] = useState("");
    const [buildingId, setBuildingId] = useState("");
    const router = useRouter();
    const query: DataCommunicationQuery = router.query as DataCommunicationQuery;

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
            setUpdatedTemplateText(changedVariablesText);
    }

    async function routeToBuilding(buildingId: string) {
        await router.push({
            pathname: `building/`,
            query: { building: buildingId },
        });
    }


    useEffect(() => {
        
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
            let currentTemplate = emailTemplates[0];
            if (query.template) {
                console.log(emailTemplates);
                console.log(query.template);
                currentTemplate = emailTemplates.find(e => e.id === Number(query.template)) || emailTemplates[0];
            }
                setSelectedTemplate(currentTemplate.name);
                setTemplateId(currentTemplate.id.toString());
                setTemplateText(currentTemplate.template);
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
    }, [router.isReady]);

    useEffect(() => {
        const changedVariablesText = fillInVariables(templateText);
        setUpdatedTemplateText(changedVariablesText);

        const template = allTemplates.find(e => e.id === Number(templateId));
        const syndic = allSyndics.find(e => e.id === Number(syndicId));
        const building = allBuildings.find(e=> e.syndic === Number(syndicId));
        if (template) {
            setTemplateText(template.template);
        }

        if (building) {
            setBuildingId(building.id.toString());
        }

    }, [allTemplates, allSyndics, allBuildings, templateId, syndicId, templateText]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>
                <div style={{ display: 'flex', width:"100%"  }}>
                    <div style={{ width: "10%" }}>
                    
                    </div>
                    <div style={{ display: 'flex', width:"100%"  }}>
                        <div style={{ width: "33%" }}>
                            <TemplateAutocomplete
                                value={selectedTemplate}
                                onChange={setSelectedTemplate}
                                setObjectId={setTemplateId}
                                required={false}
                            ></TemplateAutocomplete>
                        </div>
                        <div style={{ width: "33%" }}>
                            <SyndicAutoCompleteComponent
                                value={selectedSyndic}
                                onChange={setSelectedSyndic}
                                setObjectId={setSyndicId}
                                required={false}
                            ></SyndicAutoCompleteComponent>
                        </div>
                        <div style={{ width: "33%" }}>
                        <Button variant="secondary" size="lg"
                        onClick={() => {routeToBuilding(buildingId).then()}}>
                            Building
                        </Button>

                        </div>
                    </div>
                    <div style={{ width: "10%" }}>
                        
                    </div>
                </div>
                <div style={{ display: 'flex'}}>
                    <div style={{ width: "10%" }}>
                    
                    </div>
                    <FloatingLabel
                        controlId="floatingTextarea"
                        label="Email"
                        className="mb-3"
                        style={{ width: "100%" }}
                    >
                        <Form.Control 
                        as="textarea" 
                        placeholder="Schrijf je email hier"
                        style={{ height: '400px' }} 
                        value={updatedTemplateText}
                        onChange={handleEditTemplate}
                        />
                    </FloatingLabel>
                    <div style={{ width: "10%" }}>
                    
                    </div>
                </div>
            </>
        </>
    );
}
