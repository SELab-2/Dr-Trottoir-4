import BaseHeader from "@/components/header/BaseHeader";
import React, {useEffect, useMemo, useState} from "react";
import {getAllTours, Tour} from "@/lib/tour";
import {Region, getAllRegions} from "@/lib/region";
import {withAuthorisation} from "@/components/with-authorisation";
import {useRouter} from "next/router";
import MaterialReactTable, {type MRT_ColumnDef} from 'material-react-table';
import {Box, IconButton} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";

type TourView = {
    name: string,
    region: string,
    last_modified: string,
    tour_id : number
}

function AdminDataTours() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [tourViews, setTourViews] = useState<TourView[]>([]);

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
        })
    }, []);

    useEffect(() => {
        const tourViews: TourView[] = allTours.map((tour: Tour) => {
            const tourView: TourView = {
                name: tour.name,
                region: getRegionName(tour.region),
                last_modified: (new Date(tour.modified_at)).toLocaleString(),
                tour_id : tour.id,
            };
            return tourView;
        });
        setTourViews(tourViews);
    }, [allTours, regions]);

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
            <BaseHeader/>
            <h2>Rondes</h2>
            <MaterialReactTable
                muiTableBodyRowProps={({row}) => ({
                onClick: () => {
                    const tourView : TourView = row.original;
                    routeToEditView(tourView).then();
                },
                sx: {
                    cursor: 'pointer', // change cursor type when hovering over table row
                },
            })}
                // Don't show the tour_id
                enableHiding={false}
                initialState={{ columnVisibility: { tour_id: false } }}
                columns={columns} data={tourViews}/>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=68-429&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
        </>
    );
}


export default withAuthorisation(AdminDataTours, ["Admin", "Superstudent"]);
