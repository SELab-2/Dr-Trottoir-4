import React from "react";
import {getAllRegions, Region} from "@/lib/region";
import AutocompleteComponent from "@/components/autocompleteComponents/autocompleteComponent";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const RegionAutocomplete: React.FC<Props> = ({value, onChange}) => {

    return (
        <AutocompleteComponent
            value={value}
            label="Regio"
            fetchOptions={getAllRegions}
            onChange={onChange}
            mapping={(region: Region) => region.region}/>
    );
};

export default RegionAutocomplete;
