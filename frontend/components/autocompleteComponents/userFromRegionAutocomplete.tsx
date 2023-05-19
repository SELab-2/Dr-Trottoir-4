import React from "react";
import { getUsersFromRegion, User, userSearchString } from "@/lib/user";
import AutocompleteComponent, { MatchProps } from "@/components/autocompleteComponents/autocompleteComponent";

const UsersFromRegionAutocomplete: React.FC<MatchProps> = ({ initialId, setObjectId, matchId = null }) => {
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
