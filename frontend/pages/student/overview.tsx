import StudentHeader from "@/components/header/studentHeader";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {withAuthorisation} from "@/components/withAuthorisation";
import PlannedBuildingList from "@/components/student/PlannedBuildingList";
import {Container} from "react-bootstrap";

interface ParsedUrlQuery {
}

interface DataScheduleQuery extends ParsedUrlQuery {
    studentOnTourId?: number;
}

function StudentSchedule() {
    const router = useRouter();
    const [studentOnTourId, setStudentOnTourId] = useState<number | null>(null);

    useEffect(() => {
        const query: DataScheduleQuery = router.query as DataScheduleQuery;
        if (query.studentOnTourId) {
            setStudentOnTourId(query.studentOnTourId);
        }
    }, [router.isReady]);

    return (
        <div className="tablepageContainer">
            <StudentHeader/>
            <Container className="tableContainer">
                <PlannedBuildingList studentOnTourId={studentOnTourId} redirectTo="/student/working"/>
            </Container>
        </div>
    );
}

export default withAuthorisation(StudentSchedule, ["Student"]);
