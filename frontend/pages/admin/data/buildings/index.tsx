import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { BuildingInterface, deleteBuilding, getAddress, getAllBuildings } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Button } from "react-bootstrap";
import { CalendarMonth, Delete, Edit, Email, Info } from "@mui/icons-material";
import { BuildingView } from "@/types";
import { getUserInfo } from "@/lib/user";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";

interface ParsedUrlQuery {}

interface DataBuildingsQuery extends ParsedUrlQuery {
    syndic?: string;
}

function AdminDataBuildings() {
    const router = useRouter();
    const query: DataBuildingsQuery = router.query as DataBuildingsQuery;
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
            {
                header: "Acties",
                id: "actions",
                enableColumnActions: false,
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Details">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    routeToIndividualView(buildingView).then();
                                }}
                            >
                                <Info />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    routeToEditView(buildingView).then();
                                }}
                            >
                                <Edit />
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
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verstuur mail">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    routeToCommunication(buildingView).then();
                                }}
                            >
                                <Email />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Vuilophaling">
                            <IconButton
                                onClick={() => {
                                    const buildingView: BuildingView = row.original;
                                    routeToGarbageSchedule(buildingView).then();
                                }}
                            >
                                <CalendarMonth />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ),
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

                let cache: Record<string, { syndic: number; syndicEmail: string }> = {};

                for (const building of buildings) {
                    const s = building.syndic.toString();
                    let syndicEmail: string;
                    let syndicId: number;
                    if (s in cache) {
                        syndicEmail = cache[s].syndicEmail;
                        syndicId = cache[s].syndic;
                    } else {
                        // Get syndic email using your request
                        const res = await getUserInfo(building.syndic.toString());
                        syndicEmail = res.data.email;
                        syndicId = res.data.id;
                        cache[s] = { syndic: syndicId, syndicEmail: syndicEmail };
                    }

                    if (!query.syndic || (query.syndic && query.syndic === syndicEmail)) {
                        const buildingView: BuildingView = {
                            name: building.name,
                            address: getAddress(building),
                            building_id: building.id,
                            syndic_email: syndicEmail,
                            syndicId: syndicId,
                        };

                        buildingViews.push(buildingView);
                    }
                }
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
            query: { building: buildingView.building_id },
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

    async function routeToCommunication(buildingView: BuildingView) {
        await router.push({
            pathname: `/admin/communication`,
            query: { user: buildingView.syndicId },
        });
    }

    async function routeToIndividualView(buildingView: BuildingView) {
        await router.push({
            pathname: `/admin/building`,
            query: { id: buildingView.building_id },
        });
    }

    async function routeToGarbageSchedule(buildingView: BuildingView) {
        await router.push({
            pathname: `/admin/data/garbage-collection`,
            query: { building: buildingView.building_id },
        });
    }

    return (
        <>
            <AdminHeader />
            <MaterialReactTable
                enablePagination={false}
                enableBottomToolbar={false}
                columns={columns}
                data={buildingViews}
                state={{ isLoading: loading }}
                enableHiding={false}
                enableRowActions={false}
                initialState={{ columnVisibility: { building_id: false } }}
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
