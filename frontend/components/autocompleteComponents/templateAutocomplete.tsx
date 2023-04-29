import React from "react";

import AutocompleteComponent, { GenericProps } from "@/components/autocompleteComponents/autocompleteComponent";
import { getAllMailTemplates } from "@/lib/emailtemplate";
import { EmailTemplate } from "@/lib/email-template";

const TemplateAutocomplete: React.FC<GenericProps> = ({ initialId, setObjectId, required }) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Template${required ? "*" : ""}`}
            fetchOptions={getAllMailTemplates}
            mapping={(template: EmailTemplate) => template.name}
            setObjectId={setObjectId}
        />
    );
};

export default TemplateAutocomplete;
