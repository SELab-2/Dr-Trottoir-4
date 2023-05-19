import React from "react";
import { getTourUsersFromRegion, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { MatchProps } from "@/components/autocompleteComponents/autocompleteComponent";

const TourUserAutocomplete: React.FC<MatchProps> = ({ initialId, setObjectId, matchId = null }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={""}
            fetchOptions={() => getTourUsersFromRegion(matchId)}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default TourUserAutocomplete;
