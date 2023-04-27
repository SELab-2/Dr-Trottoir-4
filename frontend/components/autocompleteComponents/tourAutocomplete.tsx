import React from "react";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { getAllTours, Tour } from "@/lib/tour";

const TourAutocomplete: React.FC<GenericProps> = ({ value, onChange, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            value={value}
            label={`Ronde${required ? "*" : ""}`}
            fetchOptions={getAllTours}
            onChange={onChange}
            mapping={(tour: Tour) => tour.name}
            searchField={"name"}
            searchTermHandler={(value) => value}
            setObjectId={setObjectId}
        />
    );
};

export default TourAutocomplete;