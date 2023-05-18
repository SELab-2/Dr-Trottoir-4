import ToursList from "@/components/student/toursList";
import React, { useEffect, useState } from "react";
import { getCurrentUser, User } from "@/lib/user";
import { getToursOfStudent, StudentOnTour, StudentOnTourStringDate } from "@/lib/student-on-tour";
import { getTour, Tour } from "@/lib/tour";
import { getRegion, RegionInterface } from "@/lib/region";
import { datesEqual } from "@/lib/date";
import { useRouter } from "next/router";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {handleError} from "@/lib/error";

export default function PersonalSchedule({ redirectTo }: { redirectTo: string }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [toursToday, setToursToday] = useState<StudentOnTour[]>([]);
    const [prevTours, setPrevTours] = useState<StudentOnTour[]>([]);
    const [upcomingTours, setUpcomingTours] = useState<StudentOnTour[]>([]);
    const [tours, setTours] = useState<Record<number, Tour>>({});
    const [regions, setRegions] = useState<Record<number, RegionInterface>>({});
    const [errorMessages, setErrorMessages] = useState<string[]>([]);


    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                const u: User = res.data;
                setUser(u);
            })
            .catch(err => setErrorMessages(handleError(err)));
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
        getToursOfStudent(user.id, { startDate: monthAgo, endDate: nextMonth })
            .then(async (res) => {
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
                        } catch (err) {
                            setErrorMessages(handleError(err))
                        }
                    }
                }
                // Get the tours today
                const sot: StudentOnTour[] = data.map((s: StudentOnTourStringDate) => {
                    return {
                        id: s.id,
                        student: s.student,
                        tour: s.tour,
                        date: new Date(s.date),
                        completed_tour: s.completed_tour,
                        started_tour: s.started_tour,
                        current_building_index: s.current_building_index,
                        max_building_index: s.max_building_index,
                    };
                });
                const today: StudentOnTour[] = sot.filter((s: StudentOnTour) => {
                    const d: Date = s.date;
                    const currentDate: Date = new Date();
                    return datesEqual(d, currentDate);
                });
                setToursToday(today);

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
            })
            .catch(err => setErrorMessages(handleError(err)));
    }, [user]);

    function redirectToSchedule(studentOnTourId: number): void {
        router
            .push({
                pathname: redirectTo,
                query: { studentOnTourId },
            })
            .then();
    }

    return (
        <>
            <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages}/>
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
