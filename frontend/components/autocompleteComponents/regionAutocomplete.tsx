import React from "react";
import { getAllRegions, RegionInterface } from "@/lib/region";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const RegionAutocomplete: React.FC<GenericProps> = ({ value, onChange, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            value={value}
            label={`Regio${required ? "*" : ""}`}
            fetchOptions={getAllRegions}
            onChange={onChange}
            mapping={(region: RegionInterface) => region.region}
            searchField={"region"}
            searchTermHandler={(value) => value}
            setObjectId={setObjectId}
        />
    );
};

export default RegionAutocomplete;
