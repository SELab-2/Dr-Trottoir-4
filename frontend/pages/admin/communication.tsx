import AdminHeader from "@/components/header/adminHeader";
import {EmailTemplate, getAllEmailTemplates} from "@/lib/email-template";
import {ChangeEvent, useEffect, useState} from "react";
import styles from "styles/Welcome.module.css";
import {Button, FloatingLabel, Form} from "react-bootstrap";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import {BuildingInterface, getAllBuildings} from "@/lib/building";
import {getAllUsers, User} from "@/lib/user";
import UserAutoComplete from "@/components/autocompleteComponents/userAutocomplete";
import {useRouter} from "next/router";
import {withAuthorisation} from "@/components/withAuthorisation";

interface ParsedUrlQuery {}

interface DataCommunicationQuery extends ParsedUrlQuery {
    template?: number;
    user?: number;
}

function AdminCommunication() {
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const [templateText, setTemplateText] = useState("");
    const [updatedTemplateText, setUpdatedTemplateText] = useState("");
    const [templateId, setTemplateId] = useState<number>();
    const [userId, setUserId] = useState<number>();
    const router = useRouter();
    const query: DataCommunicationQuery = router.query as DataCommunicationQuery;

    const replaceVariable = (str: string, variable: string, value: string): string => {
        const regex = new RegExp(`{{\\s*${variable}\\s*}}`, "g");
        return str.replace(regex, value);
    };

    const fillInVariables = (input: string): string => {
        const currentUser = allUsers.find((e) => e.id === Number(userId));
        if (currentUser) {
            const currentBuilding = allBuildings.find((e) => e.syndic === currentUser.id);

            const replacedName = replaceVariable(
                input,
                "name",
                currentUser.first_name + " " + currentUser.last_name
            );
            if (currentBuilding) {
                return replaceVariable(
                    replacedName,
                    "address",
                    currentBuilding.street +
                    " " +
                    currentBuilding.house_number +
                    " (" +
                    currentBuilding.postal_code +
                    " " +
                    currentBuilding.city +
                    ")"
                );
            }
        }

        return input;
    };

    const handleEditTemplate = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const changedVariablesText = fillInVariables(event.target.value);
        setUpdatedTemplateText(changedVariablesText);
    };

    async function routeToBuildings(syndicId: number) {
        const currentUser = allUsers.find((e) => e.id === syndicId);
        await router.push({
            pathname: `data/buildings/`,
            query: { syndic: currentUser?.email },
        });
    }

    useEffect(() => {
        getAllEmailTemplates().then(
            (res) => {
                const emailTemplates: EmailTemplate[] = res.data;
                setAllTemplates(emailTemplates);
                let currentTemplate = emailTemplates[0];
                if (query.template) {
                    currentTemplate = emailTemplates.find((e) => e.id === query.template) || emailTemplates[0];
                }
                setTemplateId(currentTemplate.id);
                setTemplateText(currentTemplate.template);
            },
            (err) => {
                console.error(err);
            }
        );

        getAllUsers().then((res) => {
            const users: User[] = res.data;
            setAllUsers(users);
            let currentUser = users[0];
            if (query.user) {
                currentUser = users.find((e) => e.id == query.user) || users[0];
            }
            setUserId(currentUser.id);
        });

        getAllBuildings().then((res) => {
            const buildings: BuildingInterface[] = res.data;
            setAllBuildings(buildings);
        });
    }, [router.isReady]);

    useEffect(() => {
        const changedVariablesText = fillInVariables(templateText);
        setUpdatedTemplateText(changedVariablesText);

        const template = allTemplates.find((e) => e.id === templateId);
        if (template) {
            setTemplateText(template.template);
        }
    }, [allTemplates, allUsers, allBuildings, templateId, userId, templateText]);

    function getSelectedUserMail() {
        const user = allUsers.find((e) => e.id === Number(userId));
        if (user) {
            return user.email;
        }
        return "";
    }

    return (
        <>
            <>
                <AdminHeader />
                <p className={styles.title}>Communicatie extern</p>
                <div style={{ display: "flex", width: "100%" }}>
                    <div style={{ width: "10%" }}></div>
                    <div style={{ display: "flex", width: "100%" }}>
                        <div style={{ width: "33%" }}>
                            <TemplateAutocomplete
                                initialId={templateId}
                                setObjectId={setTemplateId}
                                required={false}
                            ></TemplateAutocomplete>
                        </div>
                        <div style={{ width: "33%" }}>
                            <UserAutoComplete
                                initialId={userId}
                                setObjectId={setUserId}
                                required={false}
                            ></UserAutoComplete>
                        </div>
                        <div style={{ width: "33%" }}>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => {
                                    if (userId) {
                                        routeToBuildings(userId).then();
                                    }
                                }}
                            >
                                Gebouw
                            </Button>
                        </div>
                        <div style={{ width: "33%" }}>
                            <a
                                href={`mailto:${getSelectedUserMail()}?body=${updatedTemplateText.replace(/\n/g, "%0D%0A")}`}
                                onClick={() => console.log()}
                                style={{ textDecoration: "underline", color: "royalblue" }}
                            >
                                Verstuur mail
                            </a>
                        </div>
                    </div>
                    <div style={{ width: "10%" }}></div>
                </div>
                <div style={{ display: "flex" }}>
                    <div style={{ width: "10%" }}></div>
                    <FloatingLabel
                        controlId="floatingTextarea"
                        label="Email"
                        className="mb-3"
                        style={{ width: "100%" }}
                    >
                        <Form.Control
                            as="textarea"
                            placeholder="Schrijf je email hier"
                            style={{ height: "400px" }}
                            value={updatedTemplateText}
                            onChange={handleEditTemplate}
                        />
                    </FloatingLabel>
                    <div style={{ width: "10%" }}></div>
                </div>
            </>
        </>
    );
}

export default withAuthorisation(AdminCommunication, ["Admin", "Superstudent"]);
