import React from "react";
import AutocompleteComponent, {
    GenericProps,
    MatchProps,
} from "@/components/autocompleteComponents/autocompleteComponent";
import { getToursFromRegions, Tour } from "@/lib/tour";

const TourAutocomplete: React.FC<MatchProps> = ({ initialId, setObjectId, matchId = null }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={"Selecteer ronde"}
            fetchOptions={() => getToursFromRegions(matchId)}
            mapping={(tour: Tour) => tour.name}
            setObjectId={setObjectId}
        />
    );
};

export default TourAutocomplete;
