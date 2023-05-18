import AdminHeader from "@/components/header/adminHeader";
import {EmailTemplate, getAllEmailTemplates} from "@/lib/email-template";
import {ChangeEvent, useEffect, useState} from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import TemplateAutocomplete from "@/components/autocompleteComponents/templateAutocomplete";
import {BuildingInterface, getAllBuildings} from "@/lib/building";
import {getAllUsers, User} from "@/lib/user";
import UserAutoComplete from "@/components/autocompleteComponents/userAutocomplete";
import {useRouter} from "next/router";
import {withAuthorisation} from "@/components/withAuthorisation";
import {Send} from "@mui/icons-material";
import { handleError } from "@/lib/error";

interface ParsedUrlQuery {
}

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
        const regex = new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, "g");
        return str.replace(regex, value);;
    };

    const fillInVariables = (input: string): string => {
        const currentUser = allUsers.find((e) => e.id === Number(userId));
        if (currentUser) {
            return replaceVariable(input, "name", currentUser.first_name + " " + currentUser.last_name);
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
            query: {syndic: currentUser?.email},
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
            <AdminHeader/>
            <Container>
                <p className="title">Communicatie extern</p>
                <div>
                    <Row>
                        <Col md={3}>
                            <Row>
                                <TemplateAutocomplete
                                    initialId={templateId}
                                    setObjectId={setTemplateId}
                                    required={false}
                                />
                            </Row>
                            <Row>
                                <UserAutoComplete
                                    initialId={userId}
                                    setObjectId={setUserId}
                                    required={false}
                                />
                            </Row>
                            <Row>
                                <div className="padding">
                                    <Button
                                        className="small_button"
                                        size="sm"
                                        onClick={() => {
                                            if (userId) {
                                                routeToBuildings(userId).then();
                                            }
                                        }}
                                    >
                                        Gebouw
                                    </Button>
                                </div>
                            </Row>
                        </Col>
                        <Col md={9}>
                            <Row>
                                <div style={{display: "flex"}}>
                                    <Form.Control
                                        as="textarea"
                                        className="mail_area"
                                        placeholder="Schrijf je email hier"
                                        value={updatedTemplateText}
                                        onChange={handleEditTemplate}
                                    />
                                </div>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{span: 3, offset: 3}}>
                            <div className="padding mt-auto">
                                <Button
                                    href={`mailto:${getSelectedUserMail()}?body=${encodeURIComponent(
                                        updatedTemplateText
                                    )}`}
                                    className="wide_button"
                                    size="lg"
                                    style={{
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    Verstuur mail
                                    <Send
                                        style={{height: '10px', paddingLeft: '10px', marginRight: "0.5em"}}
                                    />
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
