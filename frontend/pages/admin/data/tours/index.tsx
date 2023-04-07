import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { getAllTours, getBuildingsOfTour, Tour } from "@/lib/tour";
import { getAllRegions, RegionInterface } from "@/lib/region";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { BuildingInterface, getAddress } from "@/lib/building";
import { TourView } from "@/types";
import { TourDeleteModal } from "@/components/admin/tourDeleteModal";

// https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=68-429&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
function AdminDataTours() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [regions, setRegions] = useState<RegionInterface[]>([]);
    const [tourViews, setTourViews] = useState<TourView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buildingsOfTour, setBuildingsOfTour] = useState<{ [id: number]: BuildingInterface[] }>({});
    const [selectedTour, setSelectedTour] = useState<TourView | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<TourView>[]>(
        () => [
            {
                accessorKey: "name", //access nested data with dot notation
                header: "Naam",
            },
            {
                accessorKey: "region",
                header: "Regio",
            },
            {
                accessorKey: "last_modified", //normal accessorKey
                header: "Laatst aangepast",
            },
            {
                accessorKey: "tour_id", //normal accessorKey
                header: "tour_id",
            },
        ],
        []
    );

    // On refresh, get all the tours & regions
    useEffect(() => {
        getTours();
        getAllRegions().then(
            (res) => {
                let regions: RegionInterface[] = res.data;
                setRegions(regions);
            },
            (err) => {
                console.error(err);
            }
        );
    }, []);

    useEffect(() => {
        const tourViews: TourView[] = allTours.map((tour: Tour) => {
            const tourView: TourView = {
                name: tour.name,
                region: getRegionName(tour.region),
                last_modified: new Date(tour.modified_at).toLocaleString(),
                tour_id: tour.id,
            };
            return tourView;
        });
        allTours.forEach((t: Tour) => {
            getBuildings(t.id);
        });
        setTourViews(tourViews);
    }, [allTours, regions]);

    useEffect(() => {
        setLoading(false);
    }, [tourViews]);

    function getTours() {
        getAllTours().then(
            (res) => {
                const tours: Tour[] = res.data;
                setAllTours(tours);
            },
            (err) => {
                console.error(err);
            }
        );
    }

    /**
     * Get all the buildings of a tour
     * @param tourID the id of the tour
     */
    function getBuildings(tourID: number) {
        setBuildingsOfTour([]);
        getBuildingsOfTour(tourID).then(
            (res) => {
                const buildings: BuildingInterface[] = res.data;
                buildingsOfTour[tourID] = buildings;
                setBuildingsOfTour(buildingsOfTour);
            },
            (err) => {
                console.error(err);
            }
        );
    }

    // Get the name of a region
    function getRegionName(regionId: number): string {
        const region: RegionInterface | undefined = regions.find((region: RegionInterface) => region.id === regionId);
        if (region) {
            return region.region;
        }
        return "";
    }

    async function routeToEditView(tourView: TourView) {
        await router.push({
            pathname: `${router.pathname}/edit`,
            query: { tour: tourView.tour_id },
        });
    }

    function closeDeleteModal() {
        setShowDeleteModal(false);
        getTours();
        setSelectedTour(null);
    }

    return (
        <>
            <AdminHeader />
            <TourDeleteModal
                closeModal={closeDeleteModal}
                show={showDeleteModal}
                selectedTour={selectedTour}
                setSelectedTour={setSelectedTour}
                onDelete={closeDeleteModal}
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
                data={tourViews}
                state={{ isLoading: loading }}
                enableEditing
                enableRowNumbers
                // Don't show the tour_id
                enableHiding={false}
                initialState={{ columnVisibility: { tour_id: false } }}
                renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton
                                onClick={() => {
                                    const tourView: TourView = row.original;
                                    routeToEditView(tourView).then();
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton
                                onClick={() => {
                                    const tourView: TourView = row.original;
                                    setSelectedTour(tourView);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderDetailPanel={({ row }) => {
                    const tourView: TourView = row.original;
                    const buildings: BuildingInterface[] = buildingsOfTour[tourView.tour_id];
                    return (
                        buildings && (
                            <>
                                <label>Gebouwen op deze tour:</label>
                                <ul>
                                    {buildings.map((building: BuildingInterface) => (
                                        <li key={building.id}>{getAddress(building)}</li>
                                    ))}
                                </ul>
                            </>
                        )
                    );
                }}
                renderTopToolbarCustomActions={() => (
                    <Button onClick={() => router.push(`${router.pathname}/edit`)} variant="warning">
                        Maak nieuwe ronde aan
                    </Button>
                )}
            />
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=68-429&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
        </>
    );
}

export default withAuthorisation(AdminDataTours, ["Admin", "Superstudent"]);
