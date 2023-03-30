import BaseHeader from "@/components/header/BaseHeader";
import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/router";
import {deleteTour, getTour, postTour, Tour} from "@/lib/tour";
import {getAllRegions, getRegion, Region} from "@/lib/region";
import {BuildingInterface, getAllBuildings} from "@/lib/building";
import {BuildingOnTour, getAllBuildingsOnTourWithTourID, postBuildingOnTour} from "@/lib/building-on-tour";
import MaterialReactTable, {MRT_ColumnDef, MRT_Row} from "material-react-table";
import {Box, Tooltip} from "@mui/material";
import {Button} from "react-bootstrap";
import SaveIcon from '@mui/icons-material/Save';
import {withAuthorisation} from "@/components/with-authorisation";
import {Delete} from "@mui/icons-material";
import {useTranslation} from "react-i18next";


interface ParsedUrlQuery {
}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}

type BuildingOnTourView = {
    buildingName: string,
    city: string,
    postalCode: string,
    street: string,
    houseNumber: number,
    bus: string,
    buildingId: number,
    index: number,
}

type BuildingNotOnTourView = {
    buildingName: string,
    city: string,
    postalCode: string,
    street: string,
    houseNumber: number,
    bus: string,
    buildingId: number,
}

/**
 * TODO: implement delete, post & patch
 * @constructor
 */
function AdminDataToursEdit() {
    const { t } = useTranslation();
    const router = useRouter();
    const query: DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<Region>();
    const [allBuildingsInRegion, setAllBuildingsInRegion] = useState<BuildingInterface[]>([]);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);

    const [buildingsOnTourView, setBuildingsOnTourView] = useState<BuildingOnTourView[]>([]);
    const [buildingsNotOnTourView, setBuildingsNotOnTourView] = useState<BuildingNotOnTourView[]>([]);
    const [tourName, setTourName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [possibleRegions, setPossibleRegions] = useState<Region[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
        if (!query.tour) {
            getAllRegions().then(res => {
                setPossibleRegions(res.data);
            }, err => {
                console.error(err);
            });
            return;
        } else {
            getTour(query.tour).then(res => {
                setTour(res.data);
            }, err => {
                console.error(err);
            });
        }
    }, [router.isReady]);

    useEffect(() => {
        if (!tour) {
            return;
        }
        setTourName(tour.name);

        getRegion(tour.region).then(res => {
            setRegion(res.data);
        }, err => {
            console.error(err);
        });

        getAllBuildings().then(res => {
            const allBuildings: BuildingInterface[] = res.data;
            const buildingsInRegion = allBuildings.filter((building: BuildingInterface) => tour.region === building.region);
            setAllBuildingsInRegion(buildingsInRegion);
        }, err => {
            console.error(err);
        });

        getAllBuildingsOnTourWithTourID(tour.id).then(res => {
            const allBuildingsOnTour: BuildingOnTour[] = res.data;
            setBuildingsOnTour(allBuildingsOnTour);
        }, err => {
            console.error(err);
        });
    }, [tour]);

    useEffect(() => {
        setIsLoading(false);
        getBuildingsOnTourView();
        getBuildingsNotOnTourView();
    }, [allBuildingsInRegion, buildingsOnTour]);

    useEffect(() => {
        if (!possibleRegions || possibleRegions.length == 0 || !selectedRegion) {
            return;
        }
        const region: Region | undefined = possibleRegions.find((r: Region) => r.region === selectedRegion);
        if (!region) {
            return;
        }
        setBuildingsOnTourView([]);
        getAllBuildings().then(res => {
            const allBuildings: BuildingInterface[] = res.data;
            const buildingsInRegion = allBuildings.filter((building: BuildingInterface) => region.id === building.region);
            setIsLoading(false);
            setAllBuildingsInRegion(buildingsInRegion);
        }, err => {
            console.error(err);
        });
    }, [selectedRegion]);

    /**
     * Get the buildings in the region that are not on the tour.
     */
    function getBuildingsOnTourView() {
        let botV: BuildingOnTourView[] = buildingsOnTour.map((buildingOnTour: BuildingOnTour) => {
            const building: BuildingInterface = allBuildingsInRegion.find((building: BuildingInterface) => buildingOnTour.building === building.id)!; // This will not be undefined hence '!'
            return {
                buildingName: building?.name,
                city: building?.city,
                postalCode: building?.postal_code,
                street: building?.street,
                houseNumber: building?.house_number,
                bus: building?.bus,
                buildingId: building?.id,
                index: buildingOnTour.index,
            };
        });
        botV.sort((a: BuildingOnTourView, b: BuildingOnTourView) => a.index < b.index ? -1 : 1);
        setBuildingsOnTourView(botV);
    }

    /**
     * Get the buildings in the region that are not on the tour.
     */
    function getBuildingsNotOnTourView() {
        const allBuildingsNotOnTour = allBuildingsInRegion.filter((building: BuildingInterface) =>
            !buildingsOnTour.some((buildingOnTour: BuildingOnTour) => building.id === buildingOnTour.building)
        );
        const bnotV: BuildingNotOnTourView[] = allBuildingsNotOnTour.map((building: BuildingInterface) => {
            return {
                buildingName: building.name,
                city: building.city,
                postalCode: building.postal_code,
                street: building.street,
                houseNumber: building.house_number,
                bus: building.bus,
                buildingId: building.id,
            };
        });
        setBuildingsNotOnTourView(bnotV);
    }

    function addToBuildingOnTour(buildingNotOnTour: BuildingNotOnTourView) {
        const index: number = buildingsOnTourView.length + 1;
        const bot: BuildingOnTourView = {...buildingNotOnTour, index: index};
        const i = buildingsNotOnTourView.indexOf(buildingNotOnTour);
        if (i > -1) {
            buildingsNotOnTourView.splice(i, 1);
        }
        setBuildingsNotOnTourView([...buildingsNotOnTourView]);
        buildingsOnTourView.push(bot);
        setBuildingsOnTourView([...buildingsOnTourView]);
    }

    function removeFromBuildingOnTour(buildingOnTourView: BuildingOnTourView) {
        const removeIndex: number = buildingOnTourView.index - 1;
        buildingsOnTourView.splice(removeIndex, 1);
        buildingsOnTourView.forEach((b: BuildingOnTourView, index: number) => b.index = index + 1);
        setBuildingsOnTourView([...buildingsOnTourView]);
        const buildingNotOnTourView: BuildingNotOnTourView = {
            buildingName: buildingOnTourView.buildingName,
            city: buildingOnTourView.city,
            postalCode: buildingOnTourView.postalCode,
            street: buildingOnTourView.street,
            houseNumber: buildingOnTourView.houseNumber,
            bus: buildingOnTourView.bus,
            buildingId: buildingOnTourView.buildingId,
        };
        buildingsNotOnTourView.push(buildingNotOnTourView);
        setBuildingsNotOnTourView([...buildingsNotOnTourView]);
    }

    function saveTour() {
        if (tour) {
            // patch tour && maybe post/patch buildingOnTours buildingOnTour.tour must become null if they are being removed
        } else {
            if (!selectedRegion) {
                errorMessages.push("Een ronde moet een regio hebben.");
                setErrorMessages([...errorMessages]);
                return;
            }
            setErrorMessages([]);
            const region: Region = possibleRegions.find((r: Region) => r.region === selectedRegion)!;
            postTour(tourName, new Date(Date.now()), region.id).then(res => {
                const resTour: Tour = res.data;
                Promise.all(
                    buildingsOnTourView.map((b : BuildingOnTourView, index : number) =>
                        postBuildingOnTour(resTour.id, b.buildingId, index)
                    )
                ).then(_ => {
                    router.push("/admin/data/tours/").then();
                }, err => {
                    let errorRes = err.response;
                    if (errorRes) {
                        let data: [any, string[]][] = Object.entries(errorRes.data);
                        for (const [_, errorValues] of data) {
                            errorMessages.push(...errorValues);
                        }
                        setErrorMessages([...errorMessages]);
                    }
                });
            }, err => {
                let errorRes = err.response;
                if (errorRes) {
                    let data: [any, string[]][] = Object.entries(errorRes.data);
                    for (const [_, errorValues] of data) {
                        errorMessages.push(...errorValues);
                    }
                    setErrorMessages([...errorMessages]);
                }
            });
        }
    }

    function removeTour() {
        if (!tour) {
            return;
        }
        deleteTour(tour.id).then(async _ => {
            await router.push("/admin/data/tours/");
        }, err => {
            console.error(err);
        });
    }

    return (
        <>
            <>
                <BaseHeader/>
                {
                    (errorMessages.length > 0) && (
                        <div className={"visible alert alert-danger alert-dismissible fade show"}>
                            <ul>
                                {
                                    errorMessages.map((err : string, index : number) =>
                                        (<li key={index}>{t(err)}</li>))
                                }
                            </ul>
                            <button type="button" className="btn-close" data-bs-dismiss="alert"/>
                        </div>
                    )
                }
                <MaterialReactTable
                    columns={columnsBuildingOnTourView}
                    data={buildingsOnTourView}
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            muiTableHeadCellProps: {
                                align: 'center',
                            },
                            header: 'Acties',
                        },
                    }}
                    enablePagination={false}
                    enableEditing
                    // Don't show the tour_id
                    enableHiding={false}
                    enableBottomToolbar={false}
                    initialState={{columnVisibility: {buildingId: false}}}
                    state={{isLoading: isLoading}}
                    autoResetPageIndex={false}
                    enableRowOrdering
                    muiTableBodyRowDragHandleProps={({table}) => ({
                        onDragEnd: () => {
                            const {draggingRow, hoveredRow} = table.getState();
                            if (hoveredRow && draggingRow) {
                                buildingsOnTourView.splice(
                                    (hoveredRow as MRT_Row<BuildingOnTourView>).index,
                                    0,
                                    buildingsOnTourView.splice(draggingRow.index, 1)[0],
                                );
                                buildingsOnTourView.forEach((view: BuildingOnTourView, index) => view.index = index + 1);
                                setBuildingsOnTourView([...buildingsOnTourView]);
                            }
                        },
                    })}
                    renderRowActions={({row, table}) => (
                        <Box sx={{display: 'flex', gap: '1rem'}}>
                            <Tooltip arrow placement="left" title="Verwijder van ronde">
                                <Button variant="warning" onClick={() => {
                                    const buildingOnTourView: BuildingOnTourView = row.original;
                                    removeFromBuildingOnTour(buildingOnTourView);
                                }}>-</Button>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Box sx={{display: 'flex', gap: '1rem'}}>
                            <label>Ronde: </label>
                            <input
                                value={tourName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setTourName(e.target.value);
                                }}></input>
                            <label className={!tour ? "visible" : "invisible"}>Selecteer een regio:</label>
                            <select
                                className={!tour ? "visible" : "invisible"}
                                defaultValue={""}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRegion(e.target.value)}>
                                <option disabled value={""}></option>
                                {
                                    possibleRegions.map((regio: Region, index: number) =>
                                        (<option value={regio.region} key={index}>{regio.region}</option>))
                                }
                            </select>
                            <label
                                className={tour ? "visible" : "invisible"}>{region ? `Regio: ${region.region}` : ""}</label>
                            <label
                                className={tour ? "visible" : "invisible"}>{tour ? `Laatste aanpassing: ${(new Date(tour.modified_at)).toLocaleString()}` : ""}</label>
                            <Tooltip title="Sla op">
                                <SaveIcon onClick={() => {
                                    console.log("Sla op");// TODO: IMPLEMENT PATCH, POST
                                    saveTour();
                                }}/>
                            </Tooltip>
                            <Tooltip title="Verwijder ronde">
                                <Delete className={tour ? "visible" : "invisible"} onClick={() => {
                                    removeTour();
                                }}/>
                            </Tooltip>
                        </Box>
                    )}
                />

                <MaterialReactTable
                    columns={columnsBuildingNotOnTourView}
                    data={buildingsNotOnTourView}
                    enableBottomToolbar={false}
                    displayColumnDefOptions={{
                        'mrt-row-actions': {
                            muiTableHeadCellProps: {
                                align: 'center',
                            },
                            header: 'Acties',
                        },
                    }}
                    enablePagination={false}
                    enableEditing
                    state={{isLoading: isLoading}}
                    // Don't show the tour_id
                    enableHiding={false}
                    initialState={{columnVisibility: {buildingId: false}}}
                    renderRowActions={({row, table}) => (
                        <Box sx={{display: 'flex', gap: '1rem'}}>
                            <Tooltip arrow placement="left" title="Voeg toe aan ronde">
                                <Button variant="warning" onClick={() => {
                                    const bnot: BuildingNotOnTourView = row.original;
                                    addToBuildingOnTour(bnot);
                                }}>+</Button>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Box sx={{display: 'flex', gap: '1rem'}}>
                            <label>Gebouwen niet op deze ronde (regio {region?.region})</label>
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

export default withAuthorisation(AdminDataToursEdit, ["Admin", "Student"]);
