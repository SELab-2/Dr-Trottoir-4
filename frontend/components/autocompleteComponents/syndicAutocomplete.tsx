import React from "react";
import { getSyndics, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const SyndicAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Syndicus${required ? "*" : ""}`}
            fetchOptions={getSyndics}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default SyndicAutocomplete;
