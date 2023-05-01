import React from "react";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { BuildingInterface, getAddress, getAllBuildings } from "@/lib/building";
import { getAllTours, Tour } from "@/lib/tour";

const TourAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Selecteer ronde${required ? "*" : ""}`}
            fetchOptions={getAllTours}
            mapping={(tour: Tour) => tour.name}
            setObjectId={setObjectId}
        />
    );
};

export default TourAutocomplete;
