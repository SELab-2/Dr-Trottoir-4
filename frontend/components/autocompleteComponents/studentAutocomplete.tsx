import React from "react";
import { getStudents, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";

const StudentAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Selecteer student${required ? "*" : ""}`}
            fetchOptions={getStudents}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default StudentAutocomplete;
