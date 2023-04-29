import {GarbageCollectionEvent} from "@/types";
import styles from "@/components/calendar/calendar.module.css";
import {getAddress} from "@/lib/building";

export default function GarbageCollectionEventComponentWithAddress(
    {
        event
    }: {
        event: GarbageCollectionEvent
    }
) {
    return (
        <div>
            <label style={{ fontSize: '15px' }}>{event.garbageType}</label>
            <hr className={styles.divider} />
            <div>
                <label style={{ fontSize: '12px' }}>
                    {getAddress(event.building)}
                </label>
            </div>
        </div>
    );
}