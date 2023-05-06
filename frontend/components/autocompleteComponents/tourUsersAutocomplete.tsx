import React from "react";
import { getTourUsers, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const TourUserAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={""}
            fetchOptions={getTourUsers}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default TourUserAutocomplete;
