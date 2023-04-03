import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useMemo, useState} from "react";
import {deleteBuilding, getAllBuildings, BuildingInterface} from "@/lib/building";
import {withAuthorisation} from "@/components/withAuthorisation";
import {useRouter} from "next/router";
import MaterialReactTable, {type MRT_ColumnDef} from "material-react-table";
import {
    Box,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import {Button} from "react-bootstrap";
import {Delete, Edit} from "@mui/icons-material";
import {getAddress} from "@/lib/building";
import {BuildingView} from "@/types";
import {getUserInfo} from "@/lib/user";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";

function AdminDataBuildings() {
    const router = useRouter();
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [buildingViews, setBuildingViews] = useState<BuildingView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingView | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<BuildingView>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Naam",
            },
            {
                accessorKey: "address",
                header: "Adres",
            },
            {
                accessorKey: "building_id",
                header: "building_id",
            },
            {
                accessorKey: "syndic_email",
                header: "Syndicus",
            },
        ],
        []
    );

    useEffect(() => {
        getAllBuildings().then(
            (res) => {
                const buildings: BuildingInterface[] = res.data;
                setAllBuildings(buildings);
            },
            (err) => {
                console.error(err);
            }
        );
    }, []);


    useEffect(() => {
        async function fetchBuildingData() {
            try {
                const buildings: BuildingInterface[] = (await getAllBuildings()).data;
                const buildingViews: BuildingView[] = [];

                for (const building of buildings) {
                    // Get syndic email using your request
                    const res = await getUserInfo(building.syndic.toString());
                    const syndicEmail: string = res.data.email;

                    const buildingView: BuildingView = {
                        name: building.name,
                        address: getAddress(building),
                        building_id: building.id,
                        syndic_email: syndicEmail,
                    };

                    buildingViews.push(buildingView);
                }
                console.log(buildingViews);
                setBuildingViews(buildingViews);
            } catch (err) {
                console.error(err);
            }
        }

        fetchBuildingData().then();
    }, [allBuildings]);

    useEffect(() => {
        setLoading(false);
    }, [buildingViews]);

    async function routeToEditView(buildingView: BuildingView) {
        await router.push({
            pathname: `${router.pathname}/edit`,
            query: {building: buildingView.building_id},
        });
    }

    function removeBuilding(buildingView: BuildingView) {
        deleteBuilding(buildingView.building_id).then(
            (_) => {
                const i = buildingViews.indexOf(buildingView);
                if (i > -1) {
                    buildingViews.splice(i, 1);
                }
                setBuildingViews([...buildingViews]);
            },
            (err) => {
                console.error(err);
            }
        );
    }

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
                data={buildingViews}
                state={{isLoading: loading}}
                enableEditing
                enableHiding={false}
                initialState={{columnVisibility: {building_id: false}}}
                renderRowActions={({row}) => (
                    <Box sx={{display: "flex", gap: "1rem"}}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    routeToEditView(buildingView).then();
                                }}
                            >
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    setSelectedBuilding(buildingView);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button onClick={() => router.push(`${router.pathname}/edit`)} variant="warning">
                        Maak nieuw gebouw aan
                    </Button>
                )}
            />
            <>
                {/* Other components */}
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    title="Verwijder Gebouw"
                    description="Weet u zeker dat u dit gebouw wilt verwijderen?"
                    handleClose={() => setDeleteDialogOpen(false)}
                    handleConfirm={() => {
                        if (selectedBuilding) {
                            removeBuilding(selectedBuilding);
                        }
                        setDeleteDialogOpen(false);
                    }}
                    confirmButtonText="Verwijderen"
                    cancelButtonText="Annuleren"
                />
            </>
        </>
    );
}

export default withAuthorisation(AdminDataBuildings, ["Admin", "Superstudent"]);
