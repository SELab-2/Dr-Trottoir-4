import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { RegionInterface, getAllRegions, postRegion, patchRegion, deleteRegion } from "@/lib/region";
import { withAuthorisation } from "@/components/withAuthorisation";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useRouter } from "next/router";
import DeleteConfirmationDialog from "@/components/deleteConfirmationDialog";
import { Button } from "react-bootstrap";

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
                console.error(err);
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
            console.error(error);
        }
    }

    async function updateRegion() {
        if (selectedRegion) {
            try {
                const updatedRegion = { ...selectedRegion, region: regionName };
                await patchRegion(selectedRegion.id);
                setRegions(regions.map((region) => (region.id === selectedRegion.id ? updatedRegion : region)));
                setSelectedRegion(null);
                setRegionName("");
                setEditDialogOpen(false);
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <>
            <AdminHeader />
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
                data={regions}
                state={{ isLoading: loading }}
                enableEditing
                enableHiding={false}
                renderRowActions={({ row }) => (
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
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button onClick={() => setAddDialogOpen(true)} variant="warning">
                        Maak nieuwe regio aan
                    </Button>
                )}
            />
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Maak nieuwe regio</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Regio naam"
                        type="text"
                        fullWidth
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)} variant="secondary">
                        Annuleer
                    </Button>
                    <Button onClick={addNewRegion} variant="primary">
                        Voeg toe
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Wijzig regio</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Regio naam"
                        type="text"
                        fullWidth
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} variant="secondary">
                        Annuleren
                    </Button>
                    <Button onClick={updateRegion} variant="primary">
                        Opslaan
                    </Button>
                </DialogActions>
            </Dialog>
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
                            console.error(error);
                        }
                    }
                    setDeleteDialogOpen(false);
                }}
                confirmButtonText="Verwijderen"
                cancelButtonText="Annuleren"
            />
        </>
    );
}

export default withAuthorisation(AdminDataRegions, ["Admin", "Superstudent"]);
