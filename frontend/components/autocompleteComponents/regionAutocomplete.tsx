import React from "react";
import {getAllRegions, Region} from "@/lib/region";
import AutocompleteComponent, {GenericProps} from "@/components/autocompleteComponents/autocompleteComponent";

const RegionAutocomplete: React.FC<GenericProps> = ({value, onChange, setObjectId, required}) => {

    return (
        <AutocompleteComponent
            value={value}
            label={`Region${required ? "*" : ""}`}
            fetchOptions={getAllRegions}
            onChange={onChange}
            mapping={(region: Region) => region.region}
            searchField={"region"}
            searchTermHandler={value => value}
            setObjectId={setObjectId}
        />
    );
};

export default RegionAutocomplete;
