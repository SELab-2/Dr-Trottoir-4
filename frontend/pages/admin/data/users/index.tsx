import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {deleteUser, getAllUsers, getUserRole, User} from "@/lib/user";
import {getAllRegions, Region} from "@/lib/region";
import {UserView} from "@/types";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit, Check, Clear} from "@mui/icons-material";
import {useRouter} from "next/router";
import {useTranslation} from "react-i18next";
import {Button, Modal} from "react-bootstrap";
import {getAndSetErrors} from "@/lib/error";
import {withAuthorisation} from "@/components/withAuthorisation";
import styles from "@/styles/Login.module.css";
import {getAllRoles, Role} from "@/lib/role";

function AdminDataUsers() {
    const {t} = useTranslation();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUserViews, setAllUserViews] = useState<UserView[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserView | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successfulRemove, setSuccessfulRemove] = useState<boolean>(false);
    const [inactiveUsers, setInactiveUsers] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<UserView>[]>(
        () => [
            {
                accessorKey: "first_name",
                header: "Voornaam",
            },
            {
                accessorKey: "last_name",
                header: "Achternaam",
            },
            {
                accessorKey: "email",
                header: "E-mail",
                editable:"never"
            },
            {
                accessorKey: "role",
                header: "Rol",
            },
            {
                accessorKey: "phone_number",
                header: "Telefoonnummer",
            },
            {
                accessorKey: "userId",
                header: "userId",
                editable:"never"
            },
            {
                accessorFn: (userView) => {
                    return userView.isActive ? (<Check/>) : (<Clear/>)
                },
                id: "isActive",
                header: "Bestaat",
            },
        ],
        []
    );

    // Get users & regions on refresh
    useEffect(() => {
        getAllRegions().then(
            (res) => {
                let regions: Region[] = res.data;
                setAllRegions(regions);
            },
            (err) => {
                console.error(err);
            }
        );
        getAllRoles().then(res => {
            const roles: Role[] = res.data;
            setAllRoles(roles);
        });
        setLoading(false);
    }, []);

    useEffect(() => {
        getUsers();
    }, [inactiveUsers])

    // Get all the users
    function getUsers() {
        getAllUsers(inactiveUsers).then(res => {
            const users: User[] = res.data;
            console.log(res.data);
            setAllUsers(users);
        }, err => {
            console.error(err);
        });
    }

    // Once retrieved all the users & regions, set the userViews for the table
    useEffect(() => {
        const userViews = allUsers.map((user: User) => {
            const userView: UserView = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: t(getUserRole(user.role.toString())),
                phone_number: user.phone_number,
                userId: user.id,
                isActive: user.is_active
            }
            return userView;
        });
        setAllUserViews(userViews);
    }, [allUsers, allRegions]);

    /**
     * Remove a user, show errors if necessary
     */
    function removeUser() {
        if (!selectedUser) {
            return;
        }
        deleteUser(selectedUser?.userId).then(() => {
            setSuccessfulRemove(true);
        }, err => {
            let errorRes = err.response;
            if (errorRes && errorRes.status === 400) {
                getAndSetErrors(Object.entries(errorRes.data), setErrorMessages);
            } else if (errorRes && errorRes.status === 403) {
                const errorData: [any, string][] = Object.entries(errorRes.data);
                setErrorMessages(errorData.map(val => val[1]));
            } else {
                console.error(err);
            }
        });
    }

    /**
     * routes to the edit view of a user
     */
    async function routeToUserEditView(userView: UserView) {
        await router.push({
            pathname: `${router.pathname}/edit`,
            query: {user: userView.userId},
        });
    }

    // TODO
    function editUser() {

    }

    return (
        <>
            <AdminHeader/>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header>
                    <Modal.Title>Verwijder gebruiker:</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bent u zeker dat u
                    gebruiker {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.email}) wil
                    verwijderen?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="btn-light" onClick={() => {
                        setSelectedUser(null);
                        setShowDeleteModal(false);
                    }}>
                        Annuleer
                    </Button>
                    <Button variant="primary" className="btn-dark" onClick={async () => {
                        removeUser();
                        setShowDeleteModal(false);
                    }}>
                        Verwijder
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header>
                    <Modal.Title>Pas gebruiker aan:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card-body p-4 p-lg-5 text-black">
                        <form>
                            <div className="form-outline mb-4">
                                <label className="form-label">Voornaam</label>
                                <input type="text" className={`form-control form-control-lg ${styles.input}`} id="firstName"
                                       value={selectedUser ? selectedUser.first_name : ""}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                           if (selectedUser) {
                                               selectedUser.first_name = e.target.value
                                           }
                                       }}/>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="form-label">Achternaam</label>
                                <input type="text" className={`form-control form-control-lg ${styles.input}`} id="lastName"
                                       value={selectedUser ? selectedUser.last_name : ""}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                           if (selectedUser) {
                                               selectedUser.last_name = e.target.value
                                           }
                                       }}/>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="form-label">Email:</label>
                                <input type="text" readOnly className={`form-control form-control-lg ${styles.input}`}
                                       id="email"
                                       value={selectedUser ? selectedUser.email : ""}
                                        onChange={() => {}}
                                />
                            </div>
                            <div className="form-outline mb-4">
                                <label className="form-label">Telefoon:</label>
                                <input type="text" className={`form-control form-control-lg ${styles.input}`} id="phoneNumber"
                                       value={selectedUser ? selectedUser.phone_number : ""}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                           if (selectedUser) {
                                               selectedUser.phone_number = e.target.value
                                           }
                                       }}/>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="form-label">Rol:</label>
                                <select className={`form-control form-control-lg ${styles.input}`}
                                        value={selectedUser ? selectedUser.role : "Default"}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            if (selectedUser) {
                                                selectedUser.role = e.target.value
                                            }
                                        }}>
                                    {
                                        allRoles.map((role: Role) => (
                                            <option value={t(role.name) as string} key={role.name}>{t(role.name)}</option>))
                                    }
                                </select>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="btn-light" onClick={() => {
                        setSelectedUser(null);
                        setShowEditModal(false);
                    }}>
                        Annuleer
                    </Button>
                    <Button variant="primary" className="btn-dark" onClick={async () => {
                        removeUser();
                        setShowEditModal(false);
                    }}>
                        Pas aan
                    </Button>
                </Modal.Footer>
            </Modal>

            {
                (successfulRemove) && (
                    <div className={"visible alert alert-success alert-dismissible fade show"}>
                        <strong>Succes!</strong> De gebruiker ({selectedUser?.first_name} {selectedUser?.last_name}) werd
                        met succes verwijderd!
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => {
                                setSuccessfulRemove(false);
                                setSelectedUser(null);
                            }}
                        ></button>
                    </div>
                )
            }
            {
                (errorMessages.length !== 0) && (
                    <div className={"visible alert alert-danger alert-dismissible fade show"}>
                        <ul>
                            {errorMessages.map((err, i) => (
                                <li key={i}>{t(err)}</li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setErrorMessages([])}
                        ></button>
                    </div>
                )
            }
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
                data={allUserViews}
                state={{isLoading: loading}}
                editingMode="modal" //default
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{columnVisibility: {userId: false}}}
                renderTopToolbarCustomActions={() => (
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="switchCheckbox" checked={inactiveUsers}
                               onChange={() => {
                                   setInactiveUsers(!inactiveUsers);
                               }}/>
                        <label className="form-check-label" htmlFor="switchCheckbox">Inclusief inactieve
                            gebruikers</label>
                    </div>
                )}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton onClick={() => {
                                const user: UserView = row.original;
                                setSelectedUser(user);
                                setShowEditModal(true);
                            }}>
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton onClick={() => {
                                const user: UserView = row.original;
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                            }}>
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </>
    );
}

export default withAuthorisation(AdminDataUsers, ["Admin", "Superstudent"]);
