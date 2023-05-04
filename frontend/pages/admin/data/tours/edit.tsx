import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getAllRegions, getRegion, RegionInterface } from "@/lib/region";
import { getTour, patchTour, postTour, swapBuildingsOnTour, Tour } from "@/lib/tour";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import { BuildingOnTour, getAllBuildingsOnTourWithTourID } from "@/lib/building-on-tour";
import MaterialReactTable, { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { Box, Tooltip } from "@mui/material";
import { Button } from "react-bootstrap";
import SaveIcon from "@mui/icons-material/Save";
import { withAuthorisation } from "@/components/withAuthorisation";
import { Delete } from "@mui/icons-material";
import { handleError } from "@/lib/error";
import AdminHeader from "@/components/header/adminHeader";
import styles from "@/styles/Login.module.css";
import { BuildingNotOnTourView, BuildingOnTourView, TourView } from "@/types";
import { TourDeleteModal } from "@/components/admin/tourDeleteModal";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import Select from "react-select";

interface ParsedUrlQuery {}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}

/**
 * https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=115-606&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
 * @constructor
 */
function AdminDataToursEdit() {
    const router = useRouter();
    const query: DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<RegionInterface>();
    const [allBuildingsInRegion, setAllBuildingsInRegion] = useState<BuildingInterface[]>([]);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);

    const [buildingsOnTourView, setBuildingsOnTourView] = useState<BuildingOnTourView[]>([]);
    const [buildingsNotOnTourView, setBuildingsNotOnTourView] = useState<BuildingNotOnTourView[]>([]);
    const [tourName, setTourName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [possibleRegions, setPossibleRegions] = useState<RegionInterface[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [tourView, setTourView] = useState<TourView | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const columnsBuildingOnTourView = useMemo<MRT_ColumnDef<BuildingOnTourView>[]>(
        () => [
            {
                accessorKey: "buildingName", //access nested data with dot notation
                header: "Naam",
            },
            {
                accessorKey: "city",
                header: "Stad",
            },
            {
                accessorKey: "postalCode", //normal accessorKey
                header: "Postcode",
            },
            {
                accessorKey: "street", //normal accessorKey
                header: "Straat",
            },
            {
                accessorKey: "houseNumber", //normal accessorKey
                header: "Nummer",
            },
            {
                accessorKey: "bus", //normal accessorKey
                header: "Bus",
            },
            {
                accessorKey: "buildingId", //normal accessorKey
                header: "ID",
            },
        ],
        []
    );

    const columnsBuildingNotOnTourView = useMemo<MRT_ColumnDef<BuildingNotOnTourView>[]>(
        () => [
            {
                accessorKey: "buildingName", //access nested data with dot notation
                header: "Naam",
            },
            {
                accessorKey: "city",
                header: "Stad",
            },
            {
                accessorKey: "postalCode", //normal accessorKey
                header: "Postcode",
            },
            {
                accessorKey: "street", //normal accessorKey
                header: "Straat",
            },
            {
                accessorKey: "houseNumber", //normal accessorKey
                header: "Nummer",
            },
            {
                accessorKey: "bus", //normal accessorKey
                header: "Bus",
            },
            {
                accessorKey: "buildingId", //normal accessorKey
                header: "ID",
            },
        ],
        []
    );

    /**
     * Check if a tour is present in the router query
     */
    useEffect(() => {
        if (!query.tour) {
            getAllRegions().then(
                (res) => {
                    setPossibleRegions(res.data);
                },
                (err) => {
                    console.error(err);
                }
            );
            return;
        } else {
            getTour(query.tour).then(
                (res) => {
                    const r: Tour = res.data;
                    setTour(r);
                    setTourView({ name: r.name, region: "", tour_id: Number(query.tour), last_modified: "" });
                },
                (err) => {
                    console.error(err);
                }
            );
        }
    }, [router.isReady]);

    useEffect(() => {
        if (!tour) {
            return;
        }
        setTourName(tour.name);

        getRegion(tour.region).then(
            (res) => {
                setRegion(res.data);
            },
            (err) => {
                console.error(err);
            }
        );
        // Get all the buildings in a region TODO: wait for this endpoint and change this
        getAllBuildings().then(
            (res) => {
                const allBuildings: BuildingInterface[] = res.data;
                const buildingsInRegion = allBuildings.filter(
                    (building: BuildingInterface) => tour.region === building.region
                );
                setAllBuildingsInRegion(buildingsInRegion);
            },
            (err) => {
                console.error(err);
            }
        );
        // Get all the buildingOnTour objects of a tour
        getAllBuildingsOnTourWithTourID(tour.id).then(
            (res) => {
                const allBuildingsOnTour: BuildingOnTour[] = res.data;
                setBuildingsOnTour(allBuildingsOnTour);
            },
            (err) => {
                console.error(err);
            }
        );
    }, [tour]);

    /**
     * Set the buildings in the correct table (on tour / not on tour but in region)
     */
    useEffect(() => {
        setIsLoading(false);
        getBuildingsOnTourView();
        getBuildingsNotOnTourView();
    }, [allBuildingsInRegion, buildingsOnTour]);

    useEffect(() => {
        if (!possibleRegions || possibleRegions.length == 0 || !selectedRegion) {
            return;
        }
        // Get the selected region
        const region: RegionInterface | undefined = possibleRegions.find(
            (r: RegionInterface) => r.region === selectedRegion
        );
        if (!region) {
            return;
        }
        setBuildingsOnTourView([]);
        // Get all the buildings in a region when a region is selected
        getAllBuildings().then(
            (res) => {
                const allBuildings: BuildingInterface[] = res.data;
                const buildingsInRegion = allBuildings.filter(
                    (building: BuildingInterface) => region.id === building.region
                );
                setIsLoading(false);
                setAllBuildingsInRegion(buildingsInRegion);
            },
            (err) => {
                console.error(err);
            }
        );
    }, [selectedRegion]);

    /**
     * Get the buildings in the region that are not on the tour.
     */
    function getBuildingsOnTourView() {
        let botV: BuildingOnTourView[] = buildingsOnTour.map((buildingOnTour: BuildingOnTour) => {
            const building: BuildingInterface = allBuildingsInRegion.find(
                (building: BuildingInterface) => buildingOnTour.building === building.id
            )!; // This will not be undefined hence '!'
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
        botV.sort((a: BuildingOnTourView, b: BuildingOnTourView) => (a.index < b.index ? -1 : 1));
        setBuildingsOnTourView(botV);
    }

    /**
     * Get the buildings in the region that are not on the tour.
     */
    function getBuildingsNotOnTourView() {
        const allBuildingsNotOnTour = allBuildingsInRegion.filter(
            (building: BuildingInterface) =>
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

    /**
     * This adds a building from the buildingNotOnTour table to the buildingOnTour table
     * @param buildingNotOnTour a building that needs to be added to the buildings on the tour table
     */
    function addToBuildingOnTour(buildingNotOnTour: BuildingNotOnTourView) {
        const index: number = buildingsOnTourView.length;
        const bot: BuildingOnTourView = { ...buildingNotOnTour, index: index };
        const i = buildingsNotOnTourView.indexOf(buildingNotOnTour);
        if (i > -1) {
            buildingsNotOnTourView.splice(i, 1);
        }
        setBuildingsNotOnTourView([...buildingsNotOnTourView]);
        buildingsOnTourView.push(bot);
        setBuildingsOnTourView([...buildingsOnTourView]);
    }

    /**
     * This removes a building from the buildingOnTour table to the buildingNotOnTour table
     * @param buildingOnTourView a building that needs to be removed from the buildings on tour table
     */
    function removeFromBuildingOnTour(buildingOnTourView: BuildingOnTourView) {
        const removeIndex: number = buildingOnTourView.index;
        buildingsOnTourView.splice(removeIndex, 1);
        buildingsOnTourView.forEach((b: BuildingOnTourView, index: number) => (b.index = index));
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

    /**
     * Saves a tour, either a patch/post of a tour and post/patch/delete of buildingOntour
     */
    async function saveTour() {
        setErrorMessages([]);
        if (tourName === "") {
            setErrorMessages(["De naam van een tour mag niet leeg zijn."]);
            return;
        }
        if (tour) {
            patchTour(tour.id, { name: tourName }, new Date(Date.now())).then(
                async (_) => {
                    if (buildingsOnTourView.length > 0) {
                        const buildingIndices: { [b: number]: number } = {};
                        let i = 0;
                        for (const botv of buildingsOnTourView) {
                            buildingIndices[botv.buildingId] = i;
                            i++;
                        }
                        swapBuildingsOnTour(tour.id, buildingIndices).then(
                            (_) => {
                                router.push("/admin/data/tours/").then();
                            },
                            (err) => {
                                const e = handleError(err);
                                setErrorMessages(e);
                            }
                        );
                    } else {
                        router.push("/admin/data/tours/").then();
                    }
                },
                (err) => {
                    const e = handleError(err);
                    setErrorMessages(e);
                }
            );
        } else {
            createTour(); // POST, create a new tour
        }
    }

    // Function to create a new tour & post this new tour
    function createTour() {
        setErrorMessages([]);
        if (!selectedRegion) {
            errorMessages.push("Een ronde moet een regio hebben.");
            setErrorMessages([...errorMessages]);
            return;
        }
        const region: RegionInterface = possibleRegions.find((r: RegionInterface) => r.region === selectedRegion)!;
        postTour(tourName, new Date(Date.now()), region.id).then(
            (res) => {
                if (buildingsOnTourView.length > 0) {
                    const resTour: Tour = res.data;
                    const buildingIndices: { [b: number]: number } = {};
                    let i = 0;
                    for (const botv of buildingsOnTourView) {
                        buildingIndices[botv.buildingId] = i;
                        i++;
                    }
                    swapBuildingsOnTour(resTour.id, buildingIndices).then(
                        (_) => {
                            router.push("/admin/data/tours/").then();
                        },
                        (err) => {
                            const e = handleError(err);
                            setErrorMessages(e);
                        }
                    );
                } else {
                    router.push("/admin/data/tours/").then();
                }
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    function closeAndRouteDeleteModal() {
        setShowDeleteModal(false);
        router.push("/admin/data/tours/").then();
    }

    function closeModal() {
        setShowDeleteModal(false);
    }

    return (
        <>
            <AdminHeader />
            <TourDeleteModal
                closeModal={closeModal}
                show={showDeleteModal}
                selectedTour={tourView}
                setSelectedTour={setTourView}
                onDelete={closeAndRouteDeleteModal}
            />
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                {!tour && (
                    <>
                        <label className="form-label">Selecteer een regio:</label>
                        <Select
                            options={possibleRegions.map((region: RegionInterface) => {
                                return { value: region.region, label: region.region };
                            })}
                            value={
                                selectedRegion
                                    ? { value: selectedRegion, label: selectedRegion }
                                    : {
                                          value: "",
                                          label: "",
                                      }
                            }
                            onChange={(s) => {
                                if (s && s.value) {
                                    setSelectedRegion(s.value);
                                }
                            }}
                            placeholder={"Selecteer regio"}
                            menuPortalTarget={document.querySelector("body")}
                        />
                    </>
                )}
                <>
                    <label className="form-label">Ronde:</label>
                    <input
                        className={`form-control form-control-lg ${styles.input}`}
                        value={tourName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setTourName(e.target.value);
                        }}
                    ></input>
                </>
                {tour && (
                    <>
                        <label className="form-label">{region ? `Regio: ${region.region}` : ""}</label>
                        <label className="form-label">{`Laatste aanpassing: ${new Date(
                            tour.modified_at
                        ).toLocaleString()}`}</label>
                    </>
                )}
                <Tooltip title="Sla op">
                    <SaveIcon
                        onClick={() => {
                            saveTour().then();
                        }}
                    />
                </Tooltip>
                {tour && (
                    <Tooltip title="Verwijder ronde">
                        <Delete
                            onClick={() => {
                                setShowDeleteModal(true);
                            }}
                        />
                    </Tooltip>
                )}

                <MaterialReactTable
                    columns={columnsBuildingOnTourView}
                    data={buildingsOnTourView}
                    displayColumnDefOptions={{
                        "mrt-row-actions": {
                            muiTableHeadCellProps: {
                                align: "center",
                            },
                            header: "Acties",
                        },
                    }}
                    enablePagination={false}
                    enableEditing
                    // Don't show the tour_id
                    enableHiding={false}
                    enableBottomToolbar={false}
                    initialState={{ columnVisibility: { buildingId: false, index: false } }}
                    state={{ isLoading: isLoading }}
                    autoResetPageIndex={false}
                    enableRowNumbers
                    enableRowOrdering
                    muiTableBodyRowDragHandleProps={({ table }) => ({
                        onDragEnd: () => {
                            const { draggingRow, hoveredRow } = table.getState();
                            if (hoveredRow && draggingRow) {
                                buildingsOnTourView.splice(
                                    (hoveredRow as MRT_Row<BuildingOnTourView>).index,
                                    0,
                                    buildingsOnTourView.splice(draggingRow.index, 1)[0]
                                );
                                buildingsOnTourView.forEach((view: BuildingOnTourView, index) => (view.index = index));
                                setBuildingsOnTourView([...buildingsOnTourView]);
                            }
                        },
                    })}
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: "flex", gap: "1rem" }}>
                            <Tooltip arrow placement="left" title="Verwijder van ronde">
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        const buildingOnTourView: BuildingOnTourView = row.original;
                                        removeFromBuildingOnTour(buildingOnTourView);
                                    }}
                                >
                                    -
                                </Button>
                            </Tooltip>
                        </Box>
                    )}
                />

                <MaterialReactTable
                    columns={columnsBuildingNotOnTourView}
                    data={buildingsNotOnTourView}
                    enableBottomToolbar={false}
                    displayColumnDefOptions={{
                        "mrt-row-actions": {
                            muiTableHeadCellProps: {
                                align: "center",
                            },
                            header: "Acties",
                        },
                    }}
                    enablePagination={false}
                    enableEditing
                    state={{ isLoading: isLoading }}
                    // Don't show the tour_id
                    enableHiding={false}
                    initialState={{ columnVisibility: { buildingId: false } }}
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: "flex", gap: "1rem" }}>
                            <Tooltip arrow placement="left" title="Voeg toe aan ronde">
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        const bnot: BuildingNotOnTourView = row.original;
                                        addToBuildingOnTour(bnot);
                                    }}
                                >
                                    +
                                </Button>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Box sx={{ display: "flex", gap: "1rem" }}>
                            <label className="form-label">Gebouwen niet op deze ronde (regio {region?.region})</label>
                        </Box>
                    )}
                />
            </Box>
        </>
    );
}

export default withAuthorisation(AdminDataToursEdit, ["Admin", "SuperStudent"]);
