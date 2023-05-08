import {StudentOnTour} from "@/lib/student-on-tour";
import {Tour} from "@/lib/tour";
import {RegionInterface} from "@/lib/region";
import {ListGroup, ListGroupItem} from "react-bootstrap";

/**
 * A component for the list of the tours a student is/was assigned to
 */
export default function ToursList({
                                      listTitle,
                                      studentOnTours,
                                      allTours,
                                      allRegions,
                                      onSelect,
                                  }: {
    listTitle: String;
    studentOnTours: StudentOnTour[];
    allTours: Record<number, Tour>;
    allRegions: Record<number, RegionInterface>;
    onSelect: (studentOnTourId: number) => void;
}) {

    function getColor(sot : StudentOnTour) {
        if (sot.completed_tour) {
            return "red";
        } else {
            if (sot.current_building_index === 0) {
                return "green";
            } else {
                return "orange";
            }
        }
    }

    return (
        <>
        <div className="mt-3 mb-1 ms-2 me-2">
            <span className="h1 fw-bold">{listTitle}</span>
            {studentOnTours.length === 0 && <h5 className="mb-1">Er zijn geen rondes om weer te geven.</h5>}
            {studentOnTours.length > 0 && (
                <ListGroup>
                    {studentOnTours.map((el) => {
                        return (
                            <ListGroupItem as="a" action onClick={() => onSelect(el.id)} key={el.id}>
                                <div className="d-flex w-100 justify-content-between">
                                    <h5 className="mb-1">{allTours[el.tour] ? allTours[el.tour].name : ""}</h5>
                                    <div className="rounded-circle"
                                         style={{width: "20px", height: "20px", backgroundColor: getColor(el)}}></div>
                                </div>
                                <div className="d-flex w-100 justify-content-between">
                                    <p className="mb-1">
                                        {allTours[el.tour] && allRegions[allTours[el.tour].region]
                                            ? allRegions[allTours[el.tour].region].region
                                            : ""}
                                    </p>
                                    <small>{el.date.toLocaleDateString("en-GB")}</small>
                                </div>
                            </ListGroupItem>
                        );
                    })}
        </ListGroup>
        )}
        </div>
</>
)
    ;
}
