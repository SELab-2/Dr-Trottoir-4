import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { deleteRegion, getAllRegions, patchRegion, postRegion, RegionInterface } from "@/lib/region";
import { withAuthorisation } from "@/components/withAuthorisation";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { CalendarMonth, Delete, Edit } from "@mui/icons-material";
import { useRouter } from "next/router";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";
import { Button } from "react-bootstrap";
import RegionModal, { ModalMode } from "@/components/regionModal";
import { handleError } from "@/lib/error";

interface RegionView extends RegionInterface {}

function AdminDataRegions() {
    const router = useRouter();
    const [regions, setRegions] = useState<RegionView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRegion, setSelectedRegion] = useState<RegionView | null>(null);
    const [regionName, setRegionName] = useState<string>("");
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<RegionView>[]>(
        () => [
            {
                accessorKey: "region",
                header: "Regio naam",
            },
            {
                header: "Acties",
                id: "actions",
                enableColumnActions: false,
                Cell: ({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton
                                onClick={() => {
                                    const region: RegionView = row.original;
                                    setSelectedRegion(region);
                                    setRegionName(region.region);
                                    setEditDialogOpen(true);
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const regionView: RegionView = row.original;
                                    setSelectedRegion(regionView);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Vuilophaling">
                            <IconButton
                                onClick={() => {
                                    const regionView: RegionView = row.original;
                                    routeToGarbageSchedule(regionView).then();
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
        getAllRegions().then(
            (res) => {
                const regions: RegionInterface[] = res.data;
                setRegions(regions);
                setLoading(false);
            },
            (err) => {
                handleError(err);
                setLoading(false);
            }
        );
    }, []);

    async function addNewRegion() {
        try {
            const newRegion = { region: regionName };
            const res = await postRegion(newRegion);
            setRegions([...regions, res.data]);
            setRegionName("");
            setAddDialogOpen(false);
        } catch (error) {
            handleError(error);
        }
    }

    async function updateRegion() {
        if (selectedRegion) {
            try {
                const updatedRegion = { ...selectedRegion, region: regionName };
                await patchRegion(selectedRegion.id, { region: updatedRegion.region });
                setRegions(regions.map((region) => (region.id === selectedRegion.id ? updatedRegion : region)));
                setSelectedRegion(null);
                setRegionName("");
                setEditDialogOpen(false);
            } catch (error) {
                handleError(error);
            }
        }
    }

    // Route to the garbage view of all the buildings in the region
    async function routeToGarbageSchedule(regionView: RegionView) {
        await router.push({
            pathname: `/admin/data/garbage-collection`,
            query: { region: regionView.id },
        });
    }

    return (
        <div className="tablepageContainer">
            <AdminHeader />
            <div className="tableContainer">
                <MaterialReactTable
                    enablePagination={false}
                    enableBottomToolbar={false}
                    columns={columns}
                    data={regions}
                    state={{ isLoading: loading }}
                    enableHiding={false}
                    enableRowActions={false}
                    renderTopToolbarCustomActions={() => (
                        <Button onClick={() => setAddDialogOpen(true)} className="wide_button"
                                size="lg">
                            Maak nieuwe regio aan
                        </Button>
                    )}
                />
                <RegionModal
                    show={addDialogOpen}
                    closeModal={() => setAddDialogOpen(false)}
                    onSubmit={addNewRegion}
                    mode={ModalMode.ADD}
                    regionName={regionName}
                    setRegionName={setRegionName}
                />
                <RegionModal
                    show={editDialogOpen}
                    closeModal={() => setEditDialogOpen(false)}
                    onSubmit={updateRegion}
                    mode={ModalMode.EDIT}
                    regionName={regionName}
                    setRegionName={setRegionName}
                />
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    title="Verwijder Regio"
                    description="Weet u zeker dat u deze regio wilt verwijderen?"
                    handleClose={() => setDeleteDialogOpen(false)}
                    handleConfirm={async () => {
                        if (selectedRegion) {
                            try {
                                await deleteRegion(selectedRegion.id);
                                setRegions(regions.filter((region) => region.id !== selectedRegion.id));
                            } catch (error) {
                                handleError(error);
                            }
                            setDeleteDialogOpen(false);
                        }
                    }}
                    confirmButtonText="Verwijderen"
                    cancelButtonText="Annuleren"
                />
            </div>
        </div>
    );
}

export default withAuthorisation(AdminDataRegions, ["Admin", "Superstudent"]);
