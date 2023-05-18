import {Event} from "react-big-calendar";
import {Tour} from "@/lib/tour";
import {User} from "@/lib/user";
import {BuildingInterface} from "@/lib/building";
import {GarbageCollectionInterface} from "@/lib/garbage-collection";
import {StudentOnTourStringDate} from "@/lib/student-on-tour";

export type Login = {
    email: string;
    password: string;
};

export type SignUp = {
    first_name: string;
    last_name: string;
    phone_number: phone_number,
    email: string;
    password1: string;
    password2: string;
    verification_code: verification_code,
};

export type Reset_Password = {
    email: string;
};

export type TourView = {
    name: string;
    region: string;
    last_modified: string;
    tour_id: number;
};

export type BuildingView = {
    name: string;
    address: string;
    building_id: number;
    syndic_email: string;
    syndicId: number;
};

export type BuildingOnTourView = {
    buildingName: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    bus: string;
    buildingId: number;
    index: number;
};

export type BuildingNotOnTourView = {
    buildingName: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    bus: string;
    buildingId: number;
};

export type UserView = {
    email : string;
    first_name : string;
    last_name : string;
    role : string;
    phone_number : string;
    userId : number;
    isActive : boolean;
}

export interface ScheduleEvent extends Event {
    id : number;
    tour: Tour;
    student: User;
    start: Date;
    end: Date;
}

export interface GarbageCollectionEvent extends Event {
    start: Date,
    end: Date,
    id: number,
    building: BuildingInterface,
    garbageType: string
}

export interface FileListElement {
    url : string;
    file : File | null;
    pictureId : number | null;
}

export interface Progress {
    step : number;
    currentIndex : number;
    maxIndex : number;
}

export interface WorkedHours {
    student_id: number;
    worked_minutes: number;
    student_on_tour_ids: number[];
}

export interface BuildingAnalysis {
    building_id: number,
    expected_duration_in_seconds: number,
    arrival_time: string,
    departure_time: string,
    duration_in_seconds: number
}

export interface GarbageCollectionWebSocketInterface {
    type: "deleted" | "created_or_adapted",
    garbage_collection : GarbageCollectionInterface
}

export interface StudentOnTourWebSocketInterface {
    type: "deleted" | "created_or_adapted",
    student_on_tour: StudentOnTourStringDate
}
