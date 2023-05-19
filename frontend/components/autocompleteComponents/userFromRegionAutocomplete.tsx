import React from "react";
import {getTourUsersFromRegion, getUsersFromRegion, User, userSearchString} from "@/lib/user";
import AutocompleteComponent, { UserProps } from "@/components/autocompleteComponents/autocompleteComponent";

const UsersFromRegionAutocomplete: React.FC<UserProps> = ({ initialId, setObjectId, matchId = null }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={""}
            fetchOptions={() => getUsersFromRegion(matchId)}
            mapping={(user: User) => userSearchString(user)}
            setObjectId={setObjectId}
        />
    );
};

export default UsersFromRegionAutocomplete;
