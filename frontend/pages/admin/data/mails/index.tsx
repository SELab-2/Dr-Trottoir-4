import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {Emailtemplate, getAllMailTemplates} from "@/lib/emailtemplate";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit, Email} from "@mui/icons-material";
import {Button} from "react-bootstrap";
import {useRouter} from "next/router";

export default function AdminDataMails() {

    const router = useRouter();
    const [emailTemplates, setEmailTemplates] = useState<Emailtemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
        getAllMailTemplates().then(res => {
            const templates : Emailtemplate[] = res.data;
            setEmailTemplates(templates);
            setLoading(false);
        }, err => {
            console.error(err);
        })
    }, []);

    return (
        <>
            <>
                <AdminHeader />
                <MaterialReactTable
                    displayColumnDefOptions={{
                        "mrt-row-actions": {
                            muiTableHeadCellProps: {
                                align: "center",
                                size:"small"
                            },
                            header: "Acties",
                        },
                    }}
                    enablePagination={false}
                    enableBottomToolbar={false}
                    columns={columns}
                    data={emailTemplates}
                    state={{ isLoading: loading }}
                    enableEditing
                    renderRowActions={({ row }) => (
                        <Box>
                            <Tooltip arrow placement="left" title="Pas aan">
                                <IconButton
                                    onClick={() => {
                                        const emailtemplate: Emailtemplate = row.original;
                                    }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Verwijder">
                                <IconButton
                                    onClick={() => {
                                        const emailtemplate: Emailtemplate = row.original;
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Verstuur mail">
                                <IconButton
                                    onClick={() => {
                                        const emailtemplate: Emailtemplate = row.original;
                                    }}
                                >
                                    <Email />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderDetailPanel={({ row }) => {
                        const emailtemplate: Emailtemplate = row.original;
                        return (
                            <pre>
                                {
                                    emailtemplate.template
                                }
                            </pre>
                        );
                    }}
                    renderTopToolbarCustomActions={() => (
                        <Button onClick={() => router.push(`${router.pathname}/edit`)} variant="warning">
                            Maak nieuwe mail template aan
                        </Button>
                    )}
                />
                <p>
                    https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=115-393&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
                </p>
            </>
        </>
    );
}
