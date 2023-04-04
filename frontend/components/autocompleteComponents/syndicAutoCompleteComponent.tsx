import React from "react";
import {getAllUsers, User, userSearchString} from "@/lib/user";
import AutocompleteComponent, {GenericProps} from "@/components/autocompleteComponents/autocompleteComponent";
import {extractEmailFromString} from "@/lib/user";

const SyndicAutocomplete: React.FC<GenericProps> = ({value, onChange, setObjectId}) => {

    return (
        <AutocompleteComponent
            value={value}
            label="Syndicus"
            fetchOptions={getAllUsers} ///TODO change this to getAllSyndics once the endpoint for it exists
            onChange={onChange}
            mapping={(user: User) => userSearchString(user)}
            searchField={"email"}
            searchTermHandler={extractEmailFromString}
            setObjectId={setObjectId}
        />
    );
};

export default SyndicAutocomplete;