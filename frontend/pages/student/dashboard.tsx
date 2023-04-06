import StudentHeader from "@/components/header/studentHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import {useEffect, useState} from "react";
import getStudentOnTour, {datesEqual, formatDate, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {getCurrentUser, User} from "@/lib/user";
import {getTour, Tour} from "@/lib/tour";
import {getRegion, RegionInterface} from "@/lib/region";

// https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=32-29&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
function StudentDashboard() {

    const [user, setUser] = useState<User | null>(null);
    const [toursToday, setToursToday] = useState<StudentOnTour[]>([]);
    const [prevTours, setPrevTours] = useState<StudentOnTour[]>([]);
    const [upcomingTours, setUpcomingTours] = useState<StudentOnTour[]>([]);
    const [tours, setTours] = useState<Record<number, Tour>>({})
    const [regions, setRegions] = useState<Record<number, RegionInterface>>({});

    useEffect(() => {
        const d = formatDate(new Date(Date.now()));
        console.log(d);

        getCurrentUser().then(res => {
            const u: User = res.data;
            setUser(u);
            console.log(u);
        }, console.error);
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }
        const monthAgo: Date = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1); // This also works for january to december
        const nextMonth: Date = new Date();
        nextMonth.setMonth(monthAgo.getMonth() + 1);
        getStudentOnTour(user.id, {startDate: monthAgo, endDate: nextMonth}).then(async res => {

            const t: Record<number, Tour> = {};
            const r : Record<number, RegionInterface> = {};


            const data: StudentOnTourStringDate[] = res.data;

            for (const rec of data) {
                if (!(rec.tour in t)) {
                    try {
                        const res = await getTour(rec.tour);
                        const tour: Tour = res.data;
                        t[tour.id] = tour;
                        setTours(t);

                        if (! (tour.region in r)) { // get the region
                            const resRegion = await getRegion(tour.region);
                            const region : RegionInterface = resRegion.data;
                            r[region.id] = region;
                            setRegions(r);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            const sot: StudentOnTour[] = data.map((s: StudentOnTourStringDate) => {
                return {id: s.id, student: s.student, tour: s.tour, date: new Date(s.date)}
            });
            const today: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return datesEqual(d, currentDate);
            });
            setToursToday(today);

            const finishedTours: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return d < currentDate && !datesEqual(d, currentDate);
            });
            setPrevTours(finishedTours);

            const futureTours: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return d > currentDate && !datesEqual(d, currentDate);
            });
            setUpcomingTours(futureTours);

        }, console.error);
    }, [user]);

    return (
        <>
            <StudentHeader/>
            {
                (toursToday.length > 0) && (
                    <div className="mt-3 mb-1 ml-2">
                        <span className="h1 fw-bold">Vandaag</span>
                        <div className="list-group">
                            {
                                toursToday.map(el => {
                                    return (
                                        <a href="#" className="list-group-item list-group-item-action" key={el.id}>
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{tours[el.tour] ? tours[el.tour].name : ""}</h5>
                                                <small>{el.date.toLocaleDateString('en-GB')}</small>
                                            </div>
                                            <p className="mb-1">{tours[el.tour] && regions[tours[el.tour].region] ? regions[tours[el.tour].region].region : ""}</p>
                                            <small>TODO: set buildings here</small>
                                        </a>
                                    );
                                })
                            }
                        </div>
                    </div>
                )
            }
            {
                (upcomingTours.length > 0) && (
                    <div className="mt-3 mb-1 ml-2">
                        <span className="h1 fw-bold">Gepland</span>
                        <div className="list-group">
                            {
                                upcomingTours.map(el => {
                                    return (
                                        <a href="#" className="list-group-item list-group-item-action" key={el.id}>
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{tours[el.tour] ? tours[el.tour].name : ""}</h5>
                                                <small>{el.date.toLocaleDateString('en-GB')}</small>
                                            </div>
                                            <p className="mb-1">{tours[el.tour] && regions[tours[el.tour].region] ? regions[tours[el.tour].region].region : ""}</p>
                                        </a>
                                    );
                                })
                            }
                        </div>
                    </div>
                )
            }
            {
                (prevTours.length > 0) && (
                    <div className="mt-3 mb-1 ml-2">
                        <span className="h1 fw-bold">Afgelopen maand</span>
                        <div className="list-group">
                            {
                                prevTours.map(el => {
                                    return (
                                        <a href="#" className="list-group-item list-group-item-action" key={el.id}>
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{tours[el.tour] ? tours[el.tour].name : ""}</h5>
                                                <small>{el.date.toLocaleDateString('en-GB')}</small>
                                            </div>
                                            <p className="mb-1">{tours[el.tour] && regions[tours[el.tour].region] ? regions[tours[el.tour].region].region : ""}</p>
                                        </a>
                                    );
                                })
                            }
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
