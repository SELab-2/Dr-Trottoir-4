import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { deleteUser, getAllUsers, getUserRole, patchUser, User } from "@/lib/user";
import { getAllRegions, Region } from "@/lib/region";
import { UserView } from "@/types";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete, Edit, Check, Clear } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { withAuthorisation } from "@/components/withAuthorisation";
import { UserEditModal } from "@/components/admin/userEditModal";
import { UserDeleteModal } from "@/components/admin/userDeleteModal";

function AdminDataUsers() {
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUserViews, setAllUserViews] = useState<UserView[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserView | null>(null);
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
                editable: "never",
            },
            {
                accessorFn: (userView) => t(userView.role),
                id: "translatedRole",
                header: "Rol",
            },
            {
                accessorKey: "phone_number",
                header: "Telefoonnummer",
            },
            {
                accessorKey: "userId",
                header: "userId",
                editable: "never",
            },
            {
                accessorFn: (userView) => {
                    return userView.isActive ? <Check /> : <Clear />;
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
        setLoading(false);
    }, []);

    useEffect(() => {
        getUsers();
    }, [inactiveUsers]);

    // Get all the users
    function getUsers() {
        getAllUsers(inactiveUsers).then(
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
                role: getUserRole(user.role.toString()),
                phone_number: user.phone_number,
                userId: user.id,
                isActive: user.is_active,
            };
            return userView;
        });
        setAllUserViews(userViews);
    }, [allUsers, allRegions]);

    function closeRemoveModal() {
        getUsers();
        setShowDeleteModal(false);
    }

    function closeEditModal() {
        getUsers();
        setShowEditModal(false);
    }

    return (
        <>
            <AdminHeader />
            <UserDeleteModal
                show={showDeleteModal}
                closeModal={closeRemoveModal}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            <UserEditModal
                show={showEditModal}
                closeModal={closeEditModal}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
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
                editingMode="modal" //default
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{ columnVisibility: { userId: false } }}
                renderTopToolbarCustomActions={() => (
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="switchCheckbox"
                            checked={inactiveUsers}
                            onChange={() => {
                                setInactiveUsers(!inactiveUsers);
                            }}
                        />
                        <label className="form-check-label" htmlFor="switchCheckbox">
                            Inclusief inactieve gebruikers
                        </label>
                    </div>
                )}
                renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const user: UserView = row.original;
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const user: UserView = row.original;
                                    setSelectedUser(user);
                                    setShowDeleteModal(true);
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
