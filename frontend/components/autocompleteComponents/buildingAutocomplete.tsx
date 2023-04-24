import React from "react";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";

const BuildingAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Gebouw${required ? "*" : ""}`}
            fetchOptions={getAllBuildings}
            mapping={(building: BuildingInterface) => getAddress(building)}
            setObjectId={setObjectId}
        />
    );
};

export default BuildingAutocomplete;