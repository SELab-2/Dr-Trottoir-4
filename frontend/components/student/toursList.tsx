import { StudentOnTour } from "@/lib/student-on-tour";
import { Tour } from "@/lib/tour";
import { RegionInterface } from "@/lib/region";

/**
 * A component for the list of the tours a student is/was assigned to
 */
export default function ToursList({
    listTitle,
    studentOnTours,
    allTours,
    allRegions,
    onClick,
}: {
    listTitle: String;
    studentOnTours: StudentOnTour[];
    allTours: Record<number, Tour>;
    allRegions: Record<number, RegionInterface>;
    onClick: () => void;
}) {
    return (
        <>
            {studentOnTours.length > 0 && (
                <div className="mt-3 mb-1 ml-2" onClick={onClick}>
                    <span className="h1 fw-bold">{listTitle}</span>
                    <div className="list-group">
                        {studentOnTours.map((el) => {
                            return (
                                <a href="#" className="list-group-item list-group-item-action" key={el.id}>
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
                </div>
            )}
        </>
    );
}
