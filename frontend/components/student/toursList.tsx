import {StudentOnTour} from "@/lib/student-on-tour";
import {Tour} from "@/lib/tour";
import {RegionInterface} from "@/lib/region";

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
    return (
        <>
            <div className="mt-3 mb-1 ms-2 me-2">
                <span className="h1 fw-bold">{listTitle}</span>
                {
                    (studentOnTours.length === 0) && (
                        <h5 className="mb-1">Er zijn geen ronde om weer te geven.</h5>
                    )
                }
                {studentOnTours.length > 0 && (
                    <div className="list-group">
                        {studentOnTours.map((el) => {
                            return (
                                <a
                                    onClick={() => onSelect(el.id)}
                                    className="list-group-item list-group-item-action"
                                    key={el.id}
                                >
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">{allTours[el.tour] ? allTours[el.tour].name : ""}</h5>
                                        <small>{el.date.toLocaleDateString("en-GB")}</small>
                                    </div>
                                    <p className="mb-1">
                                        {allTours[el.tour] && allRegions[allTours[el.tour].region]
                                            ? allRegions[allTours[el.tour].region].region
                                            : ""}
                                    </p>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
