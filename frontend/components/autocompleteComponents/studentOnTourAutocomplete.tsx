import React from "react";
import AutocompleteComponent, {
  StudentOnTourProps,
} from "@/components/autocompleteComponents/autocompleteComponent";
import {
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
}) => {
  return (
    <AutocompleteComponent
      initialId={initialId}
      label={`Selecteer ronde${required ? "*" : ""}`}
      fetchOptions={() => getToursOfStudent(studentId)}
      mapping={(sot: StudentOnTour) => getTour(sot.tour).then((res) => {
        const tour : Tour = res.data;
        return `${tour.name}`;
      })}
      setObjectId={setObjectId}
    />
  );
};

export default StudentOnTourAutocomplete;
