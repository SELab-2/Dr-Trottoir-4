import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { deleteUser, getAllUsers, getUserRole, User } from "@/lib/user";
import { getAllRegions, Region } from "@/lib/region";
import { TourView, UserView } from "@/types";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "react-bootstrap";
import { getAndSetErrors } from "@/lib/error";
import { withAuthorisation } from "@/components/withAuthorisation";

function AdminDataUsers() {
    const { t } = useTranslation();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUserViews, setAllUserViews] = useState<UserView[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [userToRemove, setUserToRemove] = useState<UserView | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successfulRemove, setSuccessfulRemove] = useState<boolean>(false);

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
            },
        ],
        []
    );

    // Get users & regions on refresh
    useEffect(() => {
        getUsers();
        getAllRegions().then(
            (res) => {
                let regions: Region[] = res.data;
                setAllRegions(regions);
            },
            (err) => {
                console.error(err);
            }
        );
        setLoading(false);
    }, []);

    // Get all the users
    function getUsers() {
        getAllUsers().then(
            (res) => {
                const users: User[] = res.data;
                setAllUsers(users);
            },
            (err) => {
                console.error(err);
            }
        );
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
            };
            return userView;
        });
        setAllUserViews(userViews);
    }, [allUsers, allRegions]);

    /**
     * Remove a user, show errors if necessary
     */
    function removeUser() {
        if (!userToRemove) {
            return;
        }
        deleteUser(userToRemove?.userId).then(
            () => {
                setSuccessfulRemove(true);
            },
            (err) => {
                let errorRes = err.response;
                if (errorRes && errorRes.status === 400) {
                    getAndSetErrors(Object.entries(errorRes.data), setErrorMessages);
                } else if (errorRes && errorRes.status === 403) {
                    const errorData: [any, string][] = Object.entries(errorRes.data);
                    setErrorMessages(errorData.map((val) => val[1]));
                } else {
                    console.error(err);
                }
            }
        );
    }

    /**
     * routes to the edit view of a user
     */
    async function routeToUserEditView(userView: UserView) {
        await router.push({
            pathname: `${router.pathname}/edit`,
            query: { user: userView.userId },
        });
    }

    return (
        <>
            <AdminHeader />
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Body>
                    Bent u zeker dat u gebruiker {userToRemove?.first_name} {userToRemove?.last_name} (
                    {userToRemove?.email}) wil verwijderen?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        className="btn-light"
                        onClick={() => {
                            setUserToRemove(null);
                            setShowModal(false);
                        }}
                    >
                        Annuleer
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-dark"
                        onClick={async () => {
                            removeUser();
                            setShowModal(false);
                        }}
                    >
                        Verwijder
                    </Button>
                </Modal.Footer>
            </Modal>
            {successfulRemove && (
                <div className={"visible alert alert-success alert-dismissible fade show"}>
                    <strong>Succes!</strong> De gebruiker ({userToRemove?.first_name} {userToRemove?.last_name}) werd
                    met succes verwijderd!
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                            setSuccessfulRemove(false);
                            setUserToRemove(null);
                        }}
                    ></button>
                </div>
            )}
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
                state={{ isLoading: loading }}
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{ columnVisibility: { userId: false } }}
                renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const user: UserView = row.original;
                                    routeToUserEditView(user).then();
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const user: UserView = row.original;
                                    setUserToRemove(user);
                                    setShowModal(true);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </>
    );
}

export default withAuthorisation(AdminDataUsers, ["Admin", "Superstudent"]);
