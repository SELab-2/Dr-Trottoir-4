import React from "react";
import {getAllRegions, RegionInterface} from "@/lib/region";
import AutocompleteComponent, {GenericProps} from "@/components/autocompleteComponents/autocompleteComponent";

const RegionAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Regio${required ? "*" : ""}`}
            fetchOptions={getAllRegions}
            mapping={(region: RegionInterface) => region.region}
            setObjectId={setObjectId}
        />
    );
};

export default RegionAutocomplete;
