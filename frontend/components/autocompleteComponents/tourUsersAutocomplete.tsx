import React from "react";
import {getTourUsers, getTourUsersFromRegion, User, userSearchString} from "@/lib/user";
import AutocompleteComponent, {
    TourUserProps
} from "@/components/autocompleteComponents/autocompleteComponent";

const TourUserAutocomplete: React.FC<TourUserProps> = ({ initialId, setObjectId, tourId = null }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={""}
            fetchOptions={() => getTourUsersFromRegion(tourId)}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default TourUserAutocomplete;
