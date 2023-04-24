import React from "react";
import { getSyndics, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { extractEmailFromString } from "@/lib/user";

const SyndicAutocomplete: React.FC<GenericProps> = ({ initialValue, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialValue={initialValue}
            label={`Syndicus${required ? "*" : ""}`}
            fetchOptions={getSyndics}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default SyndicAutocomplete;
