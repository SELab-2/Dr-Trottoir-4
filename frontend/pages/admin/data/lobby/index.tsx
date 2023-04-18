import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import React, {FormEvent, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {addToLobby, deleteLobby, getAllInLobby, Lobby} from "@/lib/lobby";
import AdminHeader from "@/components/header/adminHeader";
import {getUserRole} from "@/lib/user";
import {Button, Form, Modal} from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import {getAllRoles, Role} from "@/lib/role";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";

export default function LobbyPage() {

    const {t} = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateLobbyModal, setShowCreateLobbyModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<string>();
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
    const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

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
        getAllLobbies();
        getAllRoles().then(res => {
            const r: Role[] = res.data;
            setAllRoles(r);
        }, console.error);
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

    function addLobby(event: FormEvent) {
        event.preventDefault();
        if (!role) {
            return;
        }
        const selectedRole: Role = allRoles.find(r => r.name === role)!;
        addToLobby(email, selectedRole.id).then(res => {
            const l: Lobby = res.data;
            setLobbies([...lobbies, l]);
            setShowCreateLobbyModal(false);
        }, console.error);
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
                                          if (! selectedLobby) {
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
            <Modal show={showCreateLobbyModal} onHide={() => setShowCreateLobbyModal(false)}>
                <Modal.Header>
                    <Modal.Title>Voeg toe aan lobby</Modal.Title>
                </Modal.Header>
                <Form onSubmit={addLobby}>
                    <Modal.Body>
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="form-outline mb-4">
                                <label className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className={`form-control form-control-lg ${styles.input}`}
                                    id="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setEmail(e.target.value);
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-outline mb-4">
                                <label className="form-label">Rol:</label>
                                <select
                                    defaultValue={""}
                                    className={`form-select form-control form-control-lg ${styles.input}`}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setRole(e.target.value);
                                    }}
                                >
                                    <option disabled value={""}></option>
                                    {allRoles.map((role: Role) => (
                                        <option value={role.name} key={role.name}>
                                            {t(role.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            className="btn-light"
                            onClick={() => {
                                setRole("");
                                setEmail("");
                                setShowCreateLobbyModal(false);
                            }}
                        >
                            Annuleer
                        </Button>
                        <Button
                            variant="primary"
                            className="btn-dark"
                            type="submit"
                        >
                            Voeg email toe aan lobby
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
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
                enableRowNumbers
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
                                    console.log("Edit");
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    setShowRemoveDialog(true);
                                    setSelectedLobby(row.original);
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