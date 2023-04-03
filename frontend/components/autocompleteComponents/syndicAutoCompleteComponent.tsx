import React from "react";
import {getAllUsers, User, userSearchString} from "@/lib/user";
import AutocompleteComponent, {GenericProps} from "@/components/autocompleteComponents/autocompleteComponent";

const SyndicAutocomplete: React.FC<GenericProps> = ({value, onChange}) => {

    return (
        <AutocompleteComponent
            value={value}
            label="Syndicus"
            fetchOptions={getAllUsers} ///TODO change this to getAllSyndics once the endpoint for it exists
            onChange={onChange}
            mapping={(user: User) => userSearchString(user)}/>
    );
};

export default SyndicAutocomplete;