import React from "react";

import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { getAllMailTemplates } from "@/lib/emailtemplate";
import { EmailTemplate } from "@/lib/email-template";

const TemplateAutocomplete: React.FC<GenericProps> = ({ value, onChange, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            value={value}
            label={`Template${required ? "*" : ""}`}
            fetchOptions={getAllMailTemplates}
            onChange={onChange}
            mapping={(template: EmailTemplate) => template.name}
            searchField={"email"}
            searchTermHandler={(value) => value}
            setObjectId={setObjectId}
        />
    );
};

export default TemplateAutocomplete;
