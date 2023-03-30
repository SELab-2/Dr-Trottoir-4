import BaseHeader from "@/components/header/BaseHeader";
import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/router";
import {getTour, Tour} from "@/lib/tour";
import {getRegion, Region} from "@/lib/region";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";
import {BuildingOnTour, getAllBuildingsOnTour, getAllBuildingsOnTourWithTourID} from "@/lib/building-on-tour";
import Building from "@/pages/syndic/building";
import MaterialReactTable, {MRT_ColumnDef, MRT_Row} from "material-react-table";
import {Box, IconButton, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {Button} from "react-bootstrap";


interface ParsedUrlQuery {}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}

type BuildingOnTourView = {
    buildingName : string,
    city : string,
    postalCode : string,
    street : string,
    houseNumber : number,
    bus : string,
    buildingId : number,
    index : number,
}

type BuildingNotOnTourView = {
    buildingName : string,
    city : string,
    postalCode : string,
    street : string,
    houseNumber : number,
    bus : string,
    buildingId : number,
}

export default function AdminDataToursEdit() {
    const router = useRouter();
    const query : DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<Region>();
    const [allBuildingsInRegion, setAllBuildingsInRegionInRegion] = useState<BuildingInterface[]>([]);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);

    const [buildingsOnTourView, setBuildingsOnTourView] = useState<BuildingOnTourView[]>([]);
    const [buildingsNotOnTourView, setBuildingsNotOnTourView] = useState<BuildingNotOnTourView[]>([]);

    const columnsBuildingOnTourView = useMemo<MRT_ColumnDef<BuildingOnTourView>[]>(
        () => [
            {
                accessorKey: 'buildingName', //access nested data with dot notation
                header: 'Naam',
            },
            {
                accessorKey: 'city',
                header: 'Stad',
            },
            {
                accessorKey: 'postalCode', //normal accessorKey
                header: 'Postcode',
            },
            {
                accessorKey: 'street', //normal accessorKey
                header: 'Straat',
            },
            {
                accessorKey: 'houseNumber', //normal accessorKey
                header: 'Nummer',
            },
            {
                accessorKey: 'bus', //normal accessorKey
                header: 'Bus',
            },
            {
                accessorKey: 'buildingId', //normal accessorKey
                header: 'ID',
            },
            {
                accessorKey: 'index', //normal accessorKey
                header: 'Index',
            },
        ],
        [],
    );

    const columnsBuildingNotOnTourView = useMemo<MRT_ColumnDef<BuildingNotOnTourView>[]>(
        () => [
            {
                accessorKey: 'buildingName', //access nested data with dot notation
                header: 'Naam',
            },
            {
                accessorKey: 'city',
                header: 'Stad',
            },
            {
                accessorKey: 'postalCode', //normal accessorKey
                header: 'Postcode',
            },
            {
                accessorKey: 'street', //normal accessorKey
                header: 'Straat',
            },
            {
                accessorKey: 'houseNumber', //normal accessorKey
                header: 'Nummer',
            },
            {
                accessorKey: 'bus', //normal accessorKey
                header: 'Bus',
            },
            {
                accessorKey: 'buildingId', //normal accessorKey
                header: 'ID',
            },
        ],
        [],
    );

    useEffect(() => {
        if (! query.tour) {
            return;
        }
        getTour(query.tour).then(res => {
            setTour(res.data);
        }, err => {
            console.error(err);
        });
    }, [router.isReady]);

    useEffect(() => {
        if (!tour) {
            return;
        }
        getRegion(tour.region).then(res => {
            setRegion(res.data);
        }, err => {
            console.error(err);
        });

        getAllBuildings().then(res => {
            const allBuildings : BuildingInterface[] = res.data;
            const buildingsInRegion = allBuildings.filter((building : BuildingInterface) => tour.region === building.region);
            setAllBuildingsInRegionInRegion(buildingsInRegion);
        }, err => {
            console.error(err);
        });

        getAllBuildingsOnTourWithTourID(tour.id).then(res => {
           const allBuildingsOnTour : BuildingOnTour[] = res.data;
           setBuildingsOnTour(allBuildingsOnTour);
        }, err => {
            console.error(err);
        });
    }, [tour]);

    useEffect(() => {
        getBuildingsOnTourView();
        getBuildingsNotOnTourView();
    }, [allBuildingsInRegion, buildingsOnTour]);

    function getBuildingsOnTourView() {
        let botV : BuildingOnTourView[] = buildingsOnTour.map((buildingOnTour : BuildingOnTour) => {
            const building : BuildingInterface = allBuildingsInRegion.find((building : BuildingInterface) => buildingOnTour.building === building.id)!; // This will not be undefined hence '!'
            return {
                buildingName : building?.name,
                city : building?.city,
                postalCode : building?.postal_code,
                street : building?.street,
                houseNumber : building?.house_number,
                bus : building?.bus,
                buildingId : building?.id,
                index : buildingOnTour.index + 1,
            };
        });
        botV.sort((a : BuildingOnTourView, b : BuildingOnTourView) => a.index < b.index ? -1 : 1);
        setBuildingsOnTourView(botV);
    }

    function getBuildingsNotOnTourView() {
        const allBuildingsNotOnTour = allBuildingsInRegion.filter((building : BuildingInterface) =>
            ! buildingsOnTour.some((buildingOnTour : BuildingOnTour) => building.id === buildingOnTour.building)
        );
        const bnotV : BuildingNotOnTourView[] = allBuildingsNotOnTour.map((building : BuildingInterface) => {
           return {
               buildingName : building.name,
               city : building.city,
               postalCode : building.postal_code,
               street : building.street,
               houseNumber : building.house_number,
               bus : building.bus,
               buildingId : building.id,
           };
        });
        setBuildingsNotOnTourView(bnotV);
    }

    return (
        <>
            <>
                <BaseHeader />
                <p>Laatste aanpassing: {tour? (new Date(tour.modified_at)).toLocaleString() : ""}</p>
                <p>Tour : {tour?.name}</p>
                <p>Regio : {region?.region}</p>
                <div>Gebouwen: </div>
                <MaterialReactTable
                    autoResetPageIndex={false}
                    columns={columnsBuildingOnTourView}
                    data={buildingsOnTourView}
                    enableRowOrdering
                    enableSorting={false}
                    enableHiding={false}
                    initialState={{ columnVisibility: { buildingId: false } }}
                    muiTableBodyRowDragHandleProps={({ table }) => ({
                        onDragEnd: () => {
                            const { draggingRow, hoveredRow } = table.getState();
                            if (hoveredRow && draggingRow) {
                                buildingsOnTourView.splice(
                                    (hoveredRow as MRT_Row<BuildingOnTourView>).index,
                                    0,
                                    buildingsOnTourView.splice(draggingRow.index, 1)[0],
                                );
                                buildingsOnTourView.forEach((view : BuildingOnTourView, index) => view.index = index + 1);
                                setBuildingsOnTourView([...buildingsOnTourView]);
                            }
                        },
                    })}
                />
                <div>Mogelijke toevoegingen:</div>
                <MaterialReactTable
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            muiTableHeadCellProps: {
                                align: 'center',
                            },
                            header: 'Acties',
                        },
                    }}
                    columns={columnsBuildingNotOnTourView}
                    data={buildingsNotOnTourView}
                    enableEditing
                    // Don't show the tour_id
                    enableHiding={false}
                    initialState={{ columnVisibility: { buildingId: false } }}
                    renderRowActions={({ row, table }) => (
                        <Box sx={{ display: 'flex', gap: '1rem' }}>
                            <Tooltip arrow placement="left" title="Pas aan">
                                <IconButton onClick={() => {
                                    console.log("Add to active buildings")
                                }}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                />
                <p>
                    https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=115-606&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
                </p>
            </>
        </>
    );
}
