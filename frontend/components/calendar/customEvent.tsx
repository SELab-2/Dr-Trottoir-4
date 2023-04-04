import {FC} from 'react';
import {EventProps} from 'react-big-calendar';
import MyEvent from './calendar';
import styles from "./calendar.module.css";

const CustomDisplay: FC<EventProps<MyEvent>> = ({event}) => {
    return (
        <div>
            <label className={styles.tour}>{event.title}</label>
            <hr className={styles.divider}/>
            <label className={styles.student}>{event.student}</label>
        </div>
    );
};

export default CustomDisplay;
