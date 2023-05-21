import AdminHeader from "@/components/header/adminHeader";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/email-template";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import { getAllUsers, User } from "@/lib/user";
import UserAutoComplete from "@/components/autocompleteComponents/userAutocomplete";
import { useRouter } from "next/router";
import { withAuthorisation } from "@/components/withAuthorisation";
import { Send } from "@mui/icons-material";
import { handleError } from "@/lib/error";

interface ParsedUrlQuery {}

interface DataCommunicationQuery extends ParsedUrlQuery {
    template?: number;
    user?: number;
}

function AdminCommunication() {
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [templateText, setTemplateText] = useState("");
    const [updatedTemplateText, setUpdatedTemplateText] = useState("");
    const [modifiedText, setModifiedText] = useState<string | null>(null);
    const [templateId, setTemplateId] = useState<number>();
    const [userId, setUserId] = useState<number>();
    const router = useRouter();
    const query: DataCommunicationQuery = router.query as DataCommunicationQuery;

    const replaceVariable = (str: string, variable: string, value: string): string => {
        const regex = new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, "g");
        return str.replace(regex, value);
    };

    const fillInVariables = (input: string): string => {
        if (selectedUser) {
            return replaceVariable(input, "name", selectedUser?.first_name + " " + selectedUser?.last_name);
        }

        return input;
    };

    const handleEditTemplate = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const changedVariablesText = fillInVariables(event.target.value);
        setUpdatedTemplateText(changedVariablesText);
        setModifiedText(event.target.value);
    };

    async function routeToBuildings(syndicId: number) {
        await router.push({
            pathname: `data/buildings/`,
            query: { syndic: selectedUser?.email },
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
                handleError(err);
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
            setSelectedUser(currentUser);
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

    useEffect(() => {
        const currentUser = allUsers.find((user) => user.id === userId) || null;
        setSelectedUser(currentUser);
    }, [userId]);

    useEffect(() => {
        if (modifiedText === null) {
            setUpdatedTemplateText(fillInVariables(templateText));
        } else {
            setUpdatedTemplateText(fillInVariables(modifiedText));
        }
    }, [selectedUser, modifiedText]);

    useEffect(() => {
        setModifiedText(null);
    }, [templateId]);

    function getSelectedUserMail() {
        const user = allUsers.find((e) => e.id === Number(userId));
        if (user) {
            return user.email;
        }
        return "";
    }

    return (
        <>
            <AdminHeader />
            <Container>
                <p className="title">Communicatie extern</p>
                <div>
                    <Row style={{ paddingBottom: "20px" }}>
                        <Col sm={12} md={4}>
                            <div>
                                <TemplateAutocomplete
                                    initialId={templateId}
                                    setObjectId={setTemplateId}
                                    required={false}
                                />
                            </div>
                        </Col>
                        <Col sm={12} md={4}>
                            <div>
                                <UserAutoComplete initialId={userId} setObjectId={setUserId} required={false} />
                            </div>
                        </Col>
                        <Col style={{ display: "flex", alignItems: "end", justifyContent: "end" }}>
                            <div className="padding">
                                <Button
                                    style={{ height: "50px" }}
                                    className="button"
                                    onClick={() => {
                                        if (userId) {
                                            routeToBuildings(userId).then();
                                        }
                                    }}
                                >
                                    Gebouw
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                    <div className="input-field">
                                        <Form.Control
                                            as="textarea"
                                            className="mail_area"
                                            placeholder="Schrijf je email hier"
                                            value={updatedTemplateText}
                                            onChange={handleEditTemplate}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="padding mt-auto">
                                <Button
                                    href={`mailto:${getSelectedUserMail()}?body=${encodeURIComponent(
                                        updatedTemplateText
                                    )}`}
                                    className="wide_button"
                                    size="lg"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    Verstuur mail
                                    <Send style={{ height: "10px", paddingLeft: "10px", marginRight: "0.5em" }} />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
}

export default withAuthorisation(AdminCommunication, ["Admin", "Superstudent"]);
