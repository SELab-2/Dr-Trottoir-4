import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {getAllInLobby, Lobby} from "@/lib/lobby";
import AdminHeader from "@/components/header/adminHeader";
import {getUserRole} from "@/lib/user";

export default function LobbyPage() {

    const {t} = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const columns = useMemo<MRT_ColumnDef<Lobby>[]>(
        () => [
            {
                accessorKey: "email",
                header: "E-mail",
            },
            {
                accessorKey: "verification_code",
                header: "Verificatie code",
            },
            {
                accessorFn: (lobby : Lobby) => t(getUserRole(lobby.role.toString())),
                id: "translatedRole",
                header: "Rol",
            },
            {
                accessorKey: "id",
                header: "lobbyId",
                editable: "never",
            },
        ],
        []
    );

    useEffect(() => {
        getAllInLobby().then(res => {
            const lobbies : Lobby[] = res.data;
            setLobbies(lobbies);
            setLoading(false);
        }, err => {
            console.error(err);
        });
    }, []);

    return (
        <>
            <AdminHeader/>
            <MaterialReactTable
                displayColumnDefOptions={{
                    "mrt-row-actions": {
                        muiTableHeadCellProps: {
                            align: "center",
                        },
                        header: "Acties",
                    },
                }}
                enablePagination={false}
                enableBottomToolbar={false}
                columns={columns}
                data={lobbies}
                editingMode="modal" //default
                state={{ isLoading: loading }}
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{columnVisibility: {lobbyId: false}}}
                renderTopToolbarCustomActions={() => (
                    <></>
                    // ADD button
                )}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    console.log("Edit");
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    console.log("Remove");
                                }}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </>
    );
}