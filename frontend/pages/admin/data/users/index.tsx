import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { getAllUsers, getUserRole, User } from "@/lib/user";
import { getAllRegions, RegionInterface } from "@/lib/region";
import { UserView } from "@/types";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Check, Clear, Delete, Edit, Email } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { withAuthorisation } from "@/components/withAuthorisation";
import { UserEditModal } from "@/components/admin/userEditModal";
import { UserDeleteModal } from "@/components/admin/userDeleteModal";
import { useRouter } from "next/router";
import { handleError } from "@/lib/error";

function AdminDataUsers() {
    const router = useRouter();
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUserViews, setAllUserViews] = useState<UserView[]>([]);
    const [allRegions, setAllRegions] = useState<RegionInterface[]>([]);
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
                accessorKey: "regions",
                header: "Geselecteerde regio's",
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
                header: "Actief",
            },
            {
                header: "Acties",
                id: "actions",
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="right" title="Verstuur mail">
                            <IconButton
                                onClick={() => {
                                    const userView: UserView = row.original;
                                    routeToCommunication(userView).then();
                                }}
                            >
                                <Email />
                            </IconButton>
                        </Tooltip>
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
                ),
                enableColumnActions: false,
            },
        ],
        []
    );

    // Get users & regions on refresh
    useEffect(() => {
        getAllRegions().then(
            (res) => {
                let regions: RegionInterface[] = res.data;
                setAllRegions(regions);
            },
            (err) => {
                handleError(err);
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
                handleError(err);
            }
        );
    }

    // Once retrieved all the users & regions, set the userViews for the table
    useEffect(() => {
        const userViews = allUsers.map((user: User) => {
            const selectedRegions: RegionInterface[] = allRegions.filter((r) => user.region.some((n) => n === r.id));
            const userView: UserView = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: getUserRole(user.role.toString()),
                phone_number: user.phone_number,
                userId: user.id,
                regions: selectedRegions
                    .map((r) => r.region)
                    .sort()
                    .join(", "),
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

    async function routeToCommunication(userView: UserView) {
        await router.push({
            pathname: `/admin/communication`,
            query: { user: userView.userId },
        });
    }

    return (
        <div className="tablepageContainer">
            <AdminHeader />
            <div className="tableContainer">
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
                    enablePagination={false}
                    enableBottomToolbar={false}
                    columns={columns}
                    data={allUserViews}
                    state={{ isLoading: loading }}
                    enableRowNumbers
                    enableHiding={false}
                    enableRowActions={false}
                    initialState={{ columnVisibility: { userId: false } }}
                    renderTopToolbarCustomActions={() => (
                        <div className="form-check form-switch">
                            <label className="form-check-label" htmlFor="switchCheckbox">
                                Inclusief inactieve gebruikers
                            </label>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="switchCheckbox"
                                checked={inactiveUsers}
                                onChange={() => {
                                    setInactiveUsers(!inactiveUsers);
                                }}
                            />
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

export default withAuthorisation(AdminDataUsers, ["Admin", "Superstudent"]);
