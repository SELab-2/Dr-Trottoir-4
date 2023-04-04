import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {Emailtemplate, getAllMailTemplates} from "@/lib/emailtemplate";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit, Email} from "@mui/icons-material";
import {Button} from "react-bootstrap";
import {useRouter} from "next/router";
import EditEmailModal from "@/components/editEmailModal";

export default function AdminDataMails() {

    const router = useRouter();
    const [emailTemplates, setEmailTemplates] = useState<Emailtemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Emailtemplate | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editMail, setEditMail] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<Emailtemplate>[]>(
        () => [
            {
                accessorKey: "name", //access nested data with dot notation
                header: "Naam",
            },
        ],
        []
    );

    useEffect(() => {
        getMails();
    }, []);

    function getMails() {
        getAllMailTemplates().then(res => {
            const templates: Emailtemplate[] = res.data;
            setEmailTemplates(templates);
            setLoading(false);
        }, err => {
            console.error(err);
        })
    }

    function closeEditModal() {
        setSelectedTemplate(null);
        setShowEditModal(false);
        getMails();
    }

    return (
        <>
            <AdminHeader/>
            <EditEmailModal show={showEditModal} hideModal={closeEditModal} setEmail={setSelectedTemplate}
                            selectedEmail={selectedTemplate} edit={editMail}/>
            <MaterialReactTable
                displayColumnDefOptions={{
                    "mrt-row-actions": {
                        muiTableHeadCellProps: {
                            align: "center",
                            size: "small"
                        },
                        header: "Acties",
                    },
                }}
                enablePagination={false}
                enableBottomToolbar={false}
                columns={columns}
                data={emailTemplates}
                state={{isLoading: loading}}
                enableEditing
                renderRowActions={({row}) => (
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
                                }}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verstuur mail">
                            <IconButton
                                onClick={() => {
                                    const emailtemplate: Emailtemplate = row.original;
                                    setSelectedTemplate(emailtemplate);
                                }}
                            >
                                <Email/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderDetailPanel={({row}) => {
                    const emailtemplate: Emailtemplate = row.original;
                    return (
                        <pre>{emailtemplate.template}</pre>
                    );
                }}
                renderTopToolbarCustomActions={() => (
                    <Button onClick={() => {
                        setShowEditModal(true);
                        setEditMail(false);
                    }} variant="warning">
                        Maak nieuwe mail template aan
                    </Button>
                )}
            />
        </>
    );
}
