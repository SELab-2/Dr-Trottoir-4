import React from "react";
import { getAllRegions, RegionInterface } from "@/lib/region";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const RegionAutocomplete: React.FC<GenericProps> = ({ initialValue, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialValue={initialValue}
            label={`Regio${required ? "*" : ""}`}
            fetchOptions={getAllRegions}
            mapping={(region: RegionInterface) => region.region}
            setObjectId={setObjectId}
        />
    );
};

export default RegionAutocomplete;
