import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {deleteLobby, getAllInLobby, Lobby, newVerificationCode} from "@/lib/lobby";
import AdminHeader from "@/components/header/adminHeader";
import {getUserRole} from "@/lib/user";
import {Button, Form, Modal} from "react-bootstrap";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";
import EditLobbyModal from "@/components/admin/editLobbyModal";

export default function LobbyPage() {

    const {t} = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateLobbyModal, setShowCreateLobbyModal] = useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
    const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

    // The columns for the lobby table
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
                accessorFn: (lobby: Lobby) => t(getUserRole(lobby.role.toString())),
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
        // Get all the lobbies & roles.
        getAllLobbies();
    }, []);

    function getAllLobbies() {
        getAllInLobby().then(res => {
            const lobbies: Lobby[] = res.data;
            setLobbies(lobbies);
            setLoading(false);
        }, err => {
            console.error(err);
        });
    }

    function afterPost(lobby: Lobby) {
        setLobbies([...lobbies, lobby]);
    }

    function afterPatch(lobby: Lobby) {
        if (!selectedLobby) {
            return;
        }
        const i = lobbies.findIndex(l => l.id === selectedLobby.id);
        setLobbies(prevLobbies => {
            const el = [...prevLobbies];
            el[i].email = lobby.email;
            el[i].role = lobby.role;
            return el;
        });
    }

    // Request a new verification code for a certain lobby
    function requestNewVerificationCode() {
        if (!selectedLobby) {
            return;
        }
        newVerificationCode(selectedLobby.id).then(res => {
            const lobby: Lobby = res.data;
            const i = lobbies.findIndex(l => l.id === selectedLobby.id);
            setLobbies(prevLobbies => {
                const el = [...prevLobbies];
                el[i].verification_code = lobby.verification_code;
                return el;
            });
            setSelectedLobby(lobby);
        }, console.error);
    }

    // hide the modal
    function hideModal() {
        setSelectedLobby(null);
        setShowCreateLobbyModal(false);
    }

    return (
        <>
            <AdminHeader/>
            <DeleteConfirmationDialog open={showRemoveDialog} title="Verwijder uit lobby"
                                      description={`Weet u zeker dat u ${selectedLobby?.email} (${
                                          selectedLobby ?
                                              t(getUserRole(selectedLobby.role.toString()))
                                              : ""
                                      }) uit de lobby wilt verwijderen?`}
                                      handleClose={() => {
                                          setSelectedLobby(null);
                                          setShowRemoveDialog(false);
                                      }}
                                      handleConfirm={() => {
                                          if (!selectedLobby) {
                                              return;
                                          }
                                          deleteLobby(selectedLobby.id).then(_ => {
                                              const i = lobbies.findIndex(l => l.id === selectedLobby.id);
                                              console.log(i);
                                              if (i < 0) {
                                                  return;
                                              }
                                              setLobbies(prevLobbies => {
                                                  const el = [...prevLobbies];
                                                  el.splice(i, 1);
                                                  return el;
                                              });
                                              setSelectedLobby(null);
                                              setShowRemoveDialog(false);
                                          }, console.error);
                                      }}
                                      confirmButtonText="Verwijder" cancelButtonText="Annuleer"/>
            <EditLobbyModal selectedLobby={selectedLobby} show={showCreateLobbyModal} onHide={hideModal}
                            onPatch={afterPatch} onPost={afterPost} newVerificationCode={requestNewVerificationCode}/>
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
                state={{isLoading: loading}}
                enableEditing
                enableHiding={false}
                initialState={{columnVisibility: {id: false}}}
                renderTopToolbarCustomActions={() => (
                    <Button variant="primary"
                            className="btn-dark"
                            onClick={async () => {
                                setShowCreateLobbyModal(true);
                            }}>
                        Voeg toe aan lobby
                    </Button>
                )}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const lobby: Lobby = row.original;
                                    setShowCreateLobbyModal(true);
                                    setSelectedLobby(lobby);
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const lobby: Lobby = row.original;
                                    setShowRemoveDialog(true);
                                    setSelectedLobby(lobby);
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