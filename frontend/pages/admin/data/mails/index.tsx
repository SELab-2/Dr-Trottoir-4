import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {Emailtemplate, getAllMailTemplates} from "@/lib/emailtemplate";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit, Email} from "@mui/icons-material";
import {Button} from "react-bootstrap";
import {useRouter} from "next/router";
import EditEmailModal from "@/components/admin/editEmailModal";
import { DeleteEmailModal } from "@/components/admin/deleteEmailModal";
import { handleError } from "@/lib/error";
import { withAuthorisation } from "@/components/withAuthorisation";

function AdminDataMails() {
    const router = useRouter();
    const [emailTemplates, setEmailTemplates] = useState<Emailtemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Emailtemplate | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editMail, setEditMail] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<Emailtemplate>[]>(
        () => [
            {
                accessorKey: "name", //access nested data with dot notation
                header: "Naam",
            },
            {
                header: "Acties",
                id: "actions",
                enableColumnActions: false,
                Cell: ({row}) => (
                    <Box>
                        <Tooltip arrow placement="right" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const emailtemplate: Emailtemplate = row.original;
                                    setSelectedTemplate(emailtemplate);
                                    setEditMail(true);
                                    setShowEditModal(true);
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const emailtemplate: Emailtemplate = row.original;
                                    setSelectedTemplate(emailtemplate);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verstuur mail">
                            <IconButton
                                onClick={() => {
                                    const emailtemplate: Emailtemplate = row.original;
                                    routeToCommunication(emailtemplate).then();
                                }}
                            >
                                <Email/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
            },
        ],
        []
    );

    useEffect(() => {
        getMails();
    }, []);

    function getMails() {
        getAllMailTemplates().then(
            (res) => {
                const templates: Emailtemplate[] = res.data;
                setEmailTemplates(templates);
                setLoading(false);
            },
            (err) => {
                handleError(err);
            }
        );
    }

    function closeModal() {
        setSelectedTemplate(null);
        setShowEditModal(false);
        setShowDeleteModal(false);
        getMails();
    }

    async function routeToCommunication(mailTemplate: Emailtemplate) {
        await router.push({
            pathname: `/admin/communication`,
            query: {template: mailTemplate.id},
        });
    }

    return (
        <div className="tablepageContainer">
            <AdminHeader/>
            <div className="tableContainer">
                <EditEmailModal
                    show={showEditModal}
                    hideModal={closeModal}
                    setEmail={setSelectedTemplate}
                    selectedEmail={selectedTemplate}
                    edit={editMail}
                />
                <DeleteEmailModal
                    show={showDeleteModal}
                    closeModal={closeModal}
                    selectedMail={selectedTemplate}
                    setMail={setSelectedTemplate}
                />
                <MaterialReactTable
                    enablePagination={false}
                    enableBottomToolbar={false}
                    columns={columns}
                    data={emailTemplates}
                    state={{isLoading: loading}}
                    renderDetailPanel={({row}) => {
                        const emailtemplate: Emailtemplate = row.original;
                        return <pre>{emailtemplate.template}</pre>;
                    }}
                    enableRowActions={false}
                    renderTopToolbarCustomActions={() => (
                        <Button
                            className="wide_button"
                            size="lg"
                            onClick={() => {
                                setShowEditModal(true);
                                setEditMail(false);
                            }}
                        >
                            Maak nieuwe mail template aan
                        </Button>
                    )}
                />
            </div>
        </div>
    );
}

export default withAuthorisation(AdminDataMails, ["Admin", "Superstudent"]);
