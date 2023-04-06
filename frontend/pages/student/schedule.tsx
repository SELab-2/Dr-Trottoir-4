import StudentHeader from "@/components/header/studentHeader";
import {useRouter} from "next/router";


export default function StudentSchedule() {
    const router = useRouter();

    return (
        <>
            <StudentHeader/>
        </>
    );
}
