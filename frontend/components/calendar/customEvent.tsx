import {FC} from 'react';
import {EventProps} from 'react-big-calendar';
import MyEvent from './calendar';
import styles from "./calendar.module.css";
import {User} from "@/lib/user";

// @ts-ignore
const CustomDisplay: FC<EventProps<MyEvent>> = ({event}) => {
    return (
        <div>
            <label className={styles.tour}>{event.tour.name}</label>
            <hr className={styles.divider}/>
            <div>
                <label className={styles.student}>
                    {event.students.map((student: User, index : number) => (
                        index === 0
                            ? `${student.first_name} ${student.last_name}`
                            : `, ${student.first_name} ${student.last_name}`
                    ))}
                </label>
            </div>

        </div>
    );
};

export default CustomDisplay;
