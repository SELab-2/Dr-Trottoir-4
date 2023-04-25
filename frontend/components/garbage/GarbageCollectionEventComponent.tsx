import {GarbageCollectionEvent} from "@/types";
import styles from "@/components/calendar/calendar.module.css";
import {getAddress} from "@/lib/building";

export default function GarbageCollectionEventComponent(
    {
        event
    }: {
        event: GarbageCollectionEvent
    }
) {
    return (
        <div>
            <label>{event.garbageType}</label>
            <hr className={styles.divider} />
            <div>
                <label>
                    {getAddress(event.building)}
                </label>
            </div>
        </div>
    );
}