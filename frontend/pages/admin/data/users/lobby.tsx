import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {getAllInLobby, Lobby} from "@/lib/lobby";
import AdminHeader from "@/components/header/adminHeader";
import {getUserRole} from "@/lib/user";
import {Button, Modal} from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import {UserView} from "@/types";
import {getAllRoles, Role} from "@/lib/role";

export default function LobbyPage() {

    const {t} = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateLobbyModal, setShowCreateLobbyModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<string>();
    const [allRoles, setAllRoles] = useState<Role[]>([]);

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

        getAllRoles().then(res => {
            const r : Role[] = res.data;
            setAllRoles(r);
        }, console.error);
    }, []);

    function createLobby() {
        setShowCreateLobbyModal(true);
    }

    return (
        <>
            <AdminHeader/>
            <Modal show={showCreateLobbyModal} onHide={() => setShowCreateLobbyModal(false)}>
                <Modal.Header>
                    <Modal.Title>Pas gebruiker aan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card-body p-4 p-lg-5 text-black">
                        <form>
                            <div className="form-outline mb-4">
                                <label className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className={`form-control form-control-lg ${styles.input}`}
                                    id="email"
                                    value={email}
                                    onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
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
                                        const r = e.target.value;
                                        if (r != "default") {
                                            setRole(e.target.value);
                                        }
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
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        className="btn-light"
                        onClick={() => {

                        }}
                    >
                        Annuleer
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-dark"
                        onClick={async () => {
                        }}
                    >
                        Pas aan
                    </Button>
                </Modal.Footer>
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
                state={{ isLoading: loading }}
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{columnVisibility: {id: false}}}
                renderTopToolbarCustomActions={() => (
                    <Button variant="primary"
                            className="btn-dark"
                            onClick={async () => {
                                createLobby();
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