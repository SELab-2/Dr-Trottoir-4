import AdminHeader from "@/components/header/adminHeader";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getStudentOnTour, StudentOnTour} from "@/lib/student-on-tour";
import {getAnalysisStudentOnTour} from "@/lib/analysis";
import {BuildingAnalysis} from "@/types";
import {BuildingInterface, getBuildingInfo} from "@/lib/building";

interface ParsedUrlQuery {
}

interface DataStudentOnTourQuery extends ParsedUrlQuery {
    studentOnTour?: number;
}

export default function AnalysisStudentOnTour() {
    const router = useRouter();
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [buildingsAnalysis, setBuildingsAnalysis] = useState<BuildingAnalysis[]>([]);
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);

    useEffect(() => {
        const query = router.query as DataStudentOnTourQuery;
        const studentOnTourId = query.studentOnTour;
        if (!studentOnTourId) {
            return;
        }
        getStudentOnTour(studentOnTourId).then(res => {
            const sot: StudentOnTour = res.data;
            setStudentOnTour(sot);
        }, () => {
        });

        getAnalysisStudentOnTour(studentOnTourId).then(res => {
            const b: BuildingAnalysis[] = res.data;
            setBuildingsAnalysis(b);

            Promise.all(b.map(building => getBuildingInfo(building.building_id))).then(res => {
                const buildings : BuildingInterface[] = res.map(r => r.data);
                setBuildings(buildings);
            }, () => {
            });
        }, console.error);
    }, [router.isReady]);


    return (
        <>
            <AdminHeader/>
            <p>{JSON.stringify(buildingsAnalysis)}</p>
            <p>{JSON.stringify(buildings)}</p>
        </>
    );
}