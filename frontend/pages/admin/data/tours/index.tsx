import BaseHeader from "@/components/header/BaseHeader";
import React, {useEffect, useMemo, useState} from "react";
import {getAllTours, Tour} from "@/lib/tour";
import {Region, getAllRegions} from "@/lib/region";
import {withAuthorisation} from "@/components/with-authorisation";
import {useRouter} from "next/router";
import MaterialReactTable, {
    type MRT_ColumnDef,
} from 'material-react-table';
import {Box, IconButton, Tooltip} from "@mui/material";
import {Button} from "react-bootstrap";
import {Delete, Edit} from "@mui/icons-material";
import {BuildingOnTour, getAllBuildingsOnTour, getAllBuildingsOnTourWithTourID} from "@/lib/building-on-tour";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";
import Building from "@/pages/syndic/building";

type TourView = {
    name: string,
    region: string,
    last_modified: string,
    tour_id: number
}

function AdminDataTours() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [tourViews, setTourViews] = useState<TourView[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [allBuildingOnTours, setAllBuildingsOnTours] = useState<BuildingOnTour[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);

    const columns = useMemo<MRT_ColumnDef<TourView>[]>(
        () => [
            {
                accessorKey: 'name', //access nested data with dot notation
                header: 'Naam',
            },
            {
                accessorKey: 'region',
                header: 'Regio',
            },
            {
                accessorKey: 'last_modified', //normal accessorKey
                header: 'Laatst aangepast',
            },
            {
                accessorKey: 'tour_id', //normal accessorKey
                header: 'tour_id',
            }
        ],
        [],
    );

    // On refresh, get all the tours & regions
    useEffect(() => {
        getAllTours().then(res => {
            const tours: Tour[] = res.data;
            setAllTours(tours);
        }, err => {
            console.error(err);
        });
        getAllRegions().then(res => {
            let regions: Region[] = res.data;
            setRegions(regions);
        }, err => {
            console.error(err);
        });
        getAllBuildings().then(res => {
            const buildings : BuildingInterface[] = res.data;
            setAllBuildings(buildings);
        }, err => {
           console.error(err);
        });
        getAllBuildingsOnTour().then(res => {
            const buildingsOnTours : BuildingOnTour[] = res.data;
            setAllBuildingsOnTours(buildingsOnTours);
        }, err => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        const tourViews: TourView[] = allTours.map((tour: Tour) => {
            const tourView: TourView = {
                name: tour.name,
                region: getRegionName(tour.region),
                last_modified: (new Date(tour.modified_at)).toLocaleString(),
                tour_id: tour.id,
            };
            return tourView;
        });
        setTourViews(tourViews);
    }, [allTours, regions]);

    useEffect(() => {
        setLoading(false);
    }, [tourViews]);

    function getBuildings(tourID : number) : BuildingInterface[] {
        const bot : BuildingOnTour[] = allBuildingOnTours.filter((buildingOnTour : BuildingOnTour) =>
            buildingOnTour.tour === tourID);
        const b : BuildingInterface[] = allBuildings.filter((building : BuildingInterface) =>
            bot.some((buildingOnTour : BuildingOnTour) => buildingOnTour.building === building.id));
        b.sort((a : BuildingInterface, b : BuildingInterface) => {
           const botA : BuildingOnTour | undefined = bot.find((buildingOnTour : BuildingOnTour) => buildingOnTour.building === a.id);
           const botB : BuildingOnTour | undefined = bot.find((buildingOnTour : BuildingOnTour) => buildingOnTour.building === b.id);
           if (! botA) {
               return 1;
           }
           if (! botB) {
               return -1;
           }
           return botA.index < botB.index ? -1 : 1;
        });
        return b;
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
        await router.push(
            {
                pathname: `${router.pathname}/edit`,
                query: {tour: tourView.tour_id},
            });
    }

    return (
        <>
            <BaseHeader></BaseHeader>
            <MaterialReactTable
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            align: 'center',
                        },
                        header: 'Acties',
                    },
                }}
                columns={columns}
                data={tourViews}
                state={{ isLoading: loading }}
                enableEditing
                // Don't show the tour_id
                enableHiding={false}
                initialState={{ columnVisibility: { tour_id: false } }}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                        <Tooltip arrow placement="left" title="Pas aan">
                            <IconButton onClick={() => {
                                const tourView : TourView = row.original;
                                routeToEditView(tourView).then();
                            }}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton onClick={() => console.log("Delete")}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderDetailPanel={({ row }) => {
                    const tourView : TourView = row.original;
                    return (
                        <ol>
                            {
                                getBuildings(tourView.tour_id).map((b : BuildingInterface) => (
                                   <li key={b.id}>{getAddress(b)}</li>
                                ))
                            }
                        </ol>);
                }}

                renderTopToolbarCustomActions={() => (
                    <Button
                        onClick={() => router.push(`${router.pathname}/edit`)}
                        variant="warning"
                    >
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
