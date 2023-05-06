import React from "react";
import { getAllUsers, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const StudentAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Selecteer student${required ? "*" : ""}`}
            fetchOptions={getAllUsers}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default StudentAutocomplete;