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
    function getColor(sot: StudentOnTour) {
        if (sot.completed_tour) {
            return "lightgreen";
        } else {
            if (sot.current_building_index === 0) {
                return "lightblue";
            } else {
                return "orange";
            }
        }
    }

    return (
        <>
            <div>
                <label className="subtitle">{listTitle}</label>
                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {studentOnTours.length === 0 &&
                    <ListGroup>
                        <ListGroupItem>
                            <label className="text">Er zijn geen rondes om weer te geven.</label>
                        </ListGroupItem>
                    </ListGroup>
                    }
                    {studentOnTours.length > 0 && (
                        <ListGroup>
                            {studentOnTours.map((el) => {
                                const tourName = allTours[el.tour] ? allTours[el.tour].name : "";
                                const regionName = allTours[el.tour] && allRegions[allTours[el.tour].region]
                                    ? allRegions[allTours[el.tour].region].region
                                    : "";

                                return (
                                    <ListGroupItem as="a" action onClick={() => onSelect(el.id)} key={el.id}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <label style={{fontSize: '18px', fontWeight: 'bold'}}>{tourName}</label>
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    backgroundColor: getColor(el),
                                                    marginRight: '5px'
                                                }}
                                            />
                                        </div>
                                        <p>{regionName}</p>
                                        <small>{el.date.toLocaleDateString("en-GB")}</small>
                                    </ListGroupItem>
                                );
                            })}
                        </ListGroup>
                    )}
                </div>
            </div>

        </>
    );
}
