import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit, Replay} from "@mui/icons-material";
import React, {FormEvent, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {addToLobby, deleteLobby, getAllInLobby, Lobby, newVerificationCode, patchLobby} from "@/lib/lobby";
import AdminHeader from "@/components/header/adminHeader";
import {getUserRole} from "@/lib/user";
import {Button, Form, Modal} from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import {getAllRoles, Role} from "@/lib/role";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";
import {handleError} from "@/lib/error";

export default function LobbyPage() {

    const {t} = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateLobbyModal, setShowCreateLobbyModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
    const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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

    // post/patch a lobby
    function changeLobby(event : FormEvent) {
        event.preventDefault();
        if (selectedLobby) {
            modifyLobby();
        } else {
            addLobby();
        }
    }

    // Add a lobby via a post
    function addLobby() {
        if (!role) {
            setErrorMessages(["Een rol is verplicht."])
            return;
        }
        const selectedRole: Role = allRoles.find(r => r.name === role)!;
        addToLobby(email, selectedRole.id).then(res => {
            const l: Lobby = res.data;
            setLobbies([...lobbies, l]);
            hideModal();
        }, err => {
            const e = handleError(err);
            setErrorMessages(e);
        });
    }

    // Patch a lobby
    function modifyLobby() {
        if (!role || ! selectedLobby) {
            return;
        }
        const selectedRole: Role = allRoles.find(r => r.name === role)!;
        const data : { [name: string]: string | number | number[] } = {};
        if (selectedRole.id != selectedLobby.id) {
            data['role'] = selectedRole.id;
        }
        if (email != selectedLobby.email) {
            data['email'] = email;
        }
        patchLobby(selectedLobby.id, data).then(res => {
            const lobby : Lobby = res.data;
            const i = lobbies.findIndex(l => l.id === selectedLobby.id);
            setLobbies(prevLobbies => {
                const el = [...prevLobbies];
                el[i].email = lobby.email;
                el[i].role = lobby.role;
                return el;
            });
            hideModal();
        }, err => {
            const e = handleError(err);
            setErrorMessages(e);
        });
    }

    // Request a new verification code for a certain lobby
    function requestNewVerificationCode() {
        if (! selectedLobby) {
            return;
        }
        newVerificationCode(selectedLobby.id).then(res => {
            const lobby : Lobby = res.data;
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
        setRole("");
        setEmail("");
        setShowCreateLobbyModal(false);
        setErrorMessages([]);
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
            <Modal show={showCreateLobbyModal} onHide={() => {
                hideModal()
            }}>
                <Modal.Header>
                    <Modal.Title>{selectedLobby ? "Pas lobby aan" : "Voeg toe aan lobby"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={changeLobby}>
                    <Modal.Body>
                        {errorMessages.length !== 0 && (
                            <div className={"visible alert alert-danger alert-dismissible fade show"}>
                                <ul>
                                    {errorMessages.map((err, i) => (
                                        <li key={i}>{t(err)}</li>
                                    ))}
                                </ul>
                                <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                            </div>
                        )}
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
                                    value={role}
                                    className={`form-select form-control form-control-lg ${styles.input}`}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setRole(e.target.value);
                                    }}
                                >
                                    <option disabled value=""></option>
                                    {allRoles.map((role: Role) => (
                                        <option value={role.name} key={role.name}>
                                            {t(role.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {
                                (selectedLobby) &&
                                (
                                    <div className="form-outline mb-4">
                                        <label className="form-label">Verificatiecode:</label>
                                        <input type="text"
                                               readOnly
                                               className={`form-control form-control-lg ${styles.input}`}
                                               value={selectedLobby?.verification_code}
                                               aria-describedby="regenerate"/>
                                        <div className="input-group-append">
                                            <IconButton onClick={() => requestNewVerificationCode()} id="regenerate">
                                                <Replay/>
                                            </IconButton>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            className="btn-light"
                            onClick={() => {
                                hideModal();
                            }}
                        >
                            Annuleer
                        </Button>
                        <Button
                            variant="primary"
                            className="btn-dark"
                            type="submit"
                        >
                            {selectedLobby ? "Pas aan" : "Voeg email toe aan lobby"}
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
                                    setEmail(lobby.email);
                                    setRole(allRoles.find(r => r.id === lobby.role)!.name);
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