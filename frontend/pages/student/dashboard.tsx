import StudentHeader from "@/components/header/studentHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useEffect, useState } from "react";
import { getToursOfStudent, datesEqual, StudentOnTour, StudentOnTourStringDate } from "@/lib/student-on-tour";
import { getCurrentUser, User } from "@/lib/user";
import { getTour, Tour } from "@/lib/tour";
import { getRegion, RegionInterface } from "@/lib/region";
import ToursList from "@/components/student/toursList";
import { useRouter } from "next/router";
import Loading from "@/components/loading";

// https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=32-29&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [toursToday, setToursToday] = useState<StudentOnTour[]>([]);
    const [prevTours, setPrevTours] = useState<StudentOnTour[]>([]);
    const [upcomingTours, setUpcomingTours] = useState<StudentOnTour[]>([]);
    const [tours, setTours] = useState<Record<number, Tour>>({});
    const [regions, setRegions] = useState<Record<number, RegionInterface>>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getCurrentUser().then((res) => {
            const u: User = res.data;
            setUser(u);
        }, console.error);
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }
        // Get all the tours the student is/was assigned to from one month back to next month
        const monthAgo: Date = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1); // This also works for january to december

        const nextMonth: Date = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        getToursOfStudent(user.id, { startDate: monthAgo, endDate: nextMonth }).then(async (res) => {
            // Some cache to recognize duplicate tours (to not do unnecessary requests)
            const t: Record<number, Tour> = {};
            const r: Record<number, RegionInterface> = {};

            const data: StudentOnTourStringDate[] = res.data;

            for (const rec of data) {
                // Get the tours & regions of tours where the student was assigned to
                if (!(rec.tour in t)) {
                    try {
                        const res = await getTour(rec.tour);
                        const tour: Tour = res.data;
                        t[tour.id] = tour;
                        setTours(t);

                        if (!(tour.region in r)) {
                            // get the region
                            const resRegion = await getRegion(tour.region);
                            const region: RegionInterface = resRegion.data;
                            r[region.id] = region;
                            setRegions(r);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            // Get the tours today
            const sot: StudentOnTour[] = data.map((s: StudentOnTourStringDate) => {
                return { id: s.id, student: s.student, tour: s.tour, date: new Date(s.date) };
            });
            const today: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return datesEqual(d, currentDate);
            });
            setToursToday(today);
            setLoading(false);

            // Get the tours the student has done prev month
            const finishedTours: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return d < currentDate && !datesEqual(d, currentDate);
            });
            setPrevTours(finishedTours);

            // Get the tours the student is assigned to in the future
            const futureTours: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                const d: Date = s.date;
                const currentDate: Date = new Date();
                return d > currentDate && !datesEqual(d, currentDate);
            });
            setUpcomingTours(futureTours);
        }, console.error);
    }, [user]);

    function redirectToSchedule(studentOnTourId: number, regionId: number): void {
        router
            .push({
                pathname: "/student/schedule",
                query: { regionId, studentOnTourId },
            })
            .then();
    }

    return (
        <>
            <StudentHeader />
            {loading && <Loading />}
            <ToursList
                studentOnTours={toursToday}
                listTitle="Vandaag"
                onSelect={redirectToSchedule}
                allTours={tours}
                allRegions={regions}
            />
            <ToursList
                studentOnTours={upcomingTours}
                listTitle="Gepland"
                onSelect={redirectToSchedule}
                allTours={tours}
                allRegions={regions}
            />
            <ToursList
                studentOnTours={prevTours}
                listTitle="Afgelopen maand"
                onSelect={redirectToSchedule}
                allTours={tours}
                allRegions={regions}
            />
        </>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
