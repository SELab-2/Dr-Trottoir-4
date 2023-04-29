import {GarbageCollectionEvent} from "@/types";

export default function GarbageCollectionEventComponentWithoutAddress(
    {
        event
    }: {
        event: GarbageCollectionEvent
    }
) {
    return (
        <div>
            <label style={{fontSize: '15px'}}>{event.garbageType}</label>
        </div>
    );
}