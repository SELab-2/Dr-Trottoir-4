import AdminHeader from "@/components/header/adminHeader";
import React, { useEffect, useMemo, useState } from "react";
import { deleteTour, getAllTours, getBuildingsOfTour, Tour } from "@/lib/tour";
import { Region, getAllRegions } from "@/lib/region";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { BuildingInterface, getAddress } from "@/lib/building";

type TourView = {
    name: string;
    region: string;
    last_modified: string;
    tour_id: number;
};

// https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=68-429&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
function AdminDataTours() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [tourViews, setTourViews] = useState<TourView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buildingsOfTour, setBuildingsOfTour] = useState<{ [id: number]: BuildingInterface[] }>({});

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
        getAllTours().then(
            (res) => {
                const tours: Tour[] = res.data;
                setAllTours(tours);
            },
            (err) => {
                console.error(err);
            }
        );
        getAllRegions().then(
            (res) => {
                let regions: Region[] = res.data;
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
        const region: Region | undefined = regions.find((region: Region) => region.id === regionId);
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

    function removeTour(tourView: TourView) {
        deleteTour(tourView.tour_id).then(
            (_) => {
                const i = tourViews.indexOf(tourView);
                if (i > -1) {
                    tourViews.splice(i, 1);
                }
                setTourViews([...tourViews]);
                // All buildingOnTour references need to stay in the db
            },
            (err) => {
                console.error(err);
            }
        );
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
                                    removeTour(tourView);
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
        </>
    );
}

export default withAuthorisation(AdminDataTours, ["Admin", "Superstudent"]);