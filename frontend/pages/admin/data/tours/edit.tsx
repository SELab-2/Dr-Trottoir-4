import BaseHeader from "@/components/header/BaseHeader";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getTour, Tour} from "@/lib/tour";
import {getRegion, Region} from "@/lib/region";


interface ParsedUrlQuery {}

interface DataToursEditQuery extends ParsedUrlQuery {
    tour?: number;
}


export default function AdminDataToursEdit() {
    const router = useRouter();
    const query : DataToursEditQuery = router.query as DataToursEditQuery;
    const [tour, setTour] = useState<Tour>();
    const [region, setRegion] = useState<Region>();
    const [allBuildings, setAllBuildings] = useState<Building>()

    useEffect(() => {
        if (! query.tour) {
            return;
        }

        getTour(query.tour).then(res => {
            console.log(res);
            setTour(res.data);
        }, err => {
            console.error(err);
        });
    }, [router.isReady]);

    useEffect(() => {
        if (!tour) {
            return;
        }
        getRegion(tour.region).then(res => {
            setRegion(res.data);
        }, err => {
            console.error(err);
        });
    }, [tour]);

    return (
        <>
            <>
                <BaseHeader />
                <p>{tour? (new Date(tour.modified_at)).toLocaleString() : ""}</p>
                <p>{tour?.name}</p>
                <p>{region?.region}</p>

                <p>
                    https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=115-606&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
                </p>
            </>
        </>
    );
}
