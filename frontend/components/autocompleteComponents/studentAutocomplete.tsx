import React from "react";
import { getStudents, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { extractEmailFromString } from "@/lib/user";

const StudentAutocomplete: React.FC<GenericProps> = ({ value, onChange, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            value={value}
            label={""}
            fetchOptions={getStudents}
            onChange={onChange}
            mapping={(user: User) => userSearchString(user)}
            searchField={"email"}
            searchTermHandler={extractEmailFromString}
            setObjectId={setObjectId}
        />
    );
};

export default StudentAutocomplete;