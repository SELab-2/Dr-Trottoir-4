import BaseHeader from "@/components/header/BaseHeader";
import React, {useEffect, useState} from "react";
import {getAllTours, Tour} from "@/lib/tour";
import {Region, getAllRegions} from "@/lib/region";
import {withAuthorisation} from "@/components/with-authorisation";
import {useRouter} from "next/router";

function AdminDataTours() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const defaultOption = "---";
    const [selected, setSelected] = useState<string>(defaultOption);
    const [searchInput, setSearchInput] = useState<string>("");

    // On refresh, get all the tours & regions
    useEffect(() => {
        getAllTours().then(res => {
            const tours: Tour[] = res.data;
            setTours(tours);
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

    // Search in tours when the input changes
    useEffect(() => {
        searchTours();
    }, [searchInput]);

    // Filter the regions when the selected region changes
    useEffect(() => {
        filterRegions();
    }, [selected]);

    // Get the name of a region
    function getRegioName(regionId: number): string {
        const region: Region | undefined = regions.find((region: Region) => region.id === regionId);
        if (region) {
            return region.region;
        }
        return "";
    }

    // Filter tours based on the region
    function filterRegions() {
        if (selected === defaultOption) {
            setTours(allTours);
            return;
        }
        const selectedRegion: Region | undefined = regions.find((region: Region) => region.region === selected);
        if (!selectedRegion) {
            return;
        }
        const regionId: number = selectedRegion.id;
        const toursInRegion = allTours.filter((tour: Tour) => tour.region === regionId);
        setTours(toursInRegion);
    }

    // Search based on the name of a tour
    function searchTours() {
        const isDefault = selected === defaultOption;
        const searchTours = allTours.filter((tour: Tour) => {
            const isIncluded = tour.name.toLowerCase().includes(searchInput.toLowerCase());
            const isInRegion = tour.region === regions.find((region: Region) => region.region === selected)?.id;
            return isIncluded && (isDefault || isInRegion);
        });
        setTours(searchTours);
    }

    return (
        <>
            <BaseHeader/>
            <div>
                <input value={searchInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchInput(e.target.value);
                }}></input>
                <select defaultValue={defaultOption}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelected(e.target.value)}>
                    <option value={defaultOption}>{defaultOption}</option>
                    {
                        regions.map((regio: Region, index: number) =>
                            (<option value={regio.region} key={index}>{regio.region}</option>))
                    }
                </select>
            </div>
            <table className="table table-hover">
                <thead>
                <tr>
                    <th scope="col">Naam</th>
                    <th scope="col">Regio</th>
                    <th scope="col">Laatste aanpassing</th>
                </tr>
                </thead>
                <tbody>
                {
                    tours.map((tour: Tour, index) => {
                        return (
                            <tr key={index} onClick={() => router.push({
                                pathname: "/admin/data/tours/edit",
                                query: {tour: tour.id}
                            })}>
                                <td>{tour.name}</td>
                                <td>{getRegioName(tour.region)}</td>
                                <td>{(new Date(tour.modified_at)).toLocaleString()}</td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </table>
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=68-429&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
        </>
    );
}


export default withAuthorisation(AdminDataTours, ["Admin", "Superstudent"]);
