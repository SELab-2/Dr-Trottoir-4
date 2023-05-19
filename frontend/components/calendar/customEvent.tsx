import { FC } from "react";
import { EventProps } from "react-big-calendar";
import styles from "./calendar.module.css";
import {ScheduleEvent} from "@/types";

const CustomDisplay: FC<EventProps<ScheduleEvent>> = ({ event }) => {
    return (
        <div>
            <label className={styles.tour}>{event.tour.name}</label>
            <hr className={styles.divider} />
            <div>
                <label className={styles.student}>
                    {event.student.first_name} {event.student.last_name}
                </label>
            </div>
        </div>
    );
};

export default CustomDisplay;
