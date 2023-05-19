import {GarbageCollectionEvent} from "@/types";
import styles from "@/components/calendar/calendar.module.css";
import { getAddress } from "@/lib/building";
import {FC} from "react";
import {EventProps} from "react-big-calendar";


const GarbageCollectionEventComponentWithAddress: FC<EventProps<GarbageCollectionEvent>> = ({event}) => {
    return (
        <div>
            <label style={{ fontSize: "15px" }}>{event.garbageType}</label>
            <hr className={styles.divider} />
            <div>
                <label style={{ fontSize: "12px" }}>{getAddress(event.building)}</label>
            </div>
        </div>
    );
}

export default GarbageCollectionEventComponentWithAddress;
