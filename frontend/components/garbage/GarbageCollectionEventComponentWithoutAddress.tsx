import { GarbageCollectionEvent } from "@/types";
import styles from "@/components/calendar/calendar.module.css";
import { getAddress } from "@/lib/building";

export default function GarbageCollectionEventComponentWithoutAddress({ event }: { event: GarbageCollectionEvent }) {
    return (
        <div>
            <label style={{ fontSize: "15px" }}>{event.garbageType}</label>
        </div>
    );
}
