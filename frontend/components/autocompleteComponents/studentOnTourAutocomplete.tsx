import React from "react";
import AutocompleteComponent, { StudentOnTourProps } from "@/components/autocompleteComponents/autocompleteComponent";
import {
    getActualToursOfStudent,
    getToursOfStudent,
    StudentOnTour,
    studentOnTourSearchString,
    StudentOnTourStringDate,
} from "@/lib/student-on-tour";
import { getTour, Tour } from "@/lib/tour";

const StudentOnTourAutocomplete: React.FC<StudentOnTourProps> = ({
    initialId,
    setObjectId,
    required,
    studentId,
    disabled = false,
}) => {
    return (
        <AutocompleteComponent
            initialId={initialId}
            label={`Selecteer ronde${required ? "*" : ""}`}
            fetchOptions={() => getActualToursOfStudent(studentId)}
            mapping={(tour: Tour) => tour.name}
            setObjectId={setObjectId}
            disabled={disabled}
        />
    );
};

export default StudentOnTourAutocomplete;
