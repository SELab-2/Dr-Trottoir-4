import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {getAllUsers, getUserRole, User} from "@/lib/user";
import {getAllRegions, Region} from "@/lib/region";
import {UserView} from "@/types";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {useRouter} from "next/router";
import {useTranslation} from "react-i18next";

export default function AdminDataUsers() {
    const {t} = useTranslation();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUserViews, setAllUserViews] = useState<UserView[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
                accessorKey:"userId",
                header: "userId"
            }
        ],
        []
    );

    useEffect(() => {
        getAllUsers().then(res => {
            const users: User[] = res.data;
            setAllUsers(users);
        }, err => {
            console.error(err);
        });
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
        const userViews = allUsers.map((user: User) => {
            const userView: UserView = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: t(getUserRole(user.role.toString())),
                phone_number: user.phone_number,
                userId : user.id,
            }
            return userView;
        });
        setAllUserViews(userViews);
    }, [allUsers, allRegions]);

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
                data={allUserViews}
                state={{isLoading: loading}}
                enableEditing
                enableRowNumbers
                enableHiding={false}
                initialState={{columnVisibility: {userId: false}}}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton>
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton>
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />
        </>
    );
}
