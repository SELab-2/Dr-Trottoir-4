import { useEffect, useState } from "react";

interface LiveFieldProps<T> {
    fetcher: () => Promise<T>;
    interval?: number;
    formatter: (data: T) => string;
}

function LiveField<T>({ fetcher, interval = 1000, formatter }: LiveFieldProps<T>) {
    const [data, setData] = useState<string>("");

    useEffect(() => {
        fetcher().then((result) => {
            setData(formatter(result));
        });

        const intervalId = setInterval(() => {
            fetcher().then((result) => {
                setData(formatter(result));
            });
        }, interval);

        return () => clearInterval(intervalId);
    }, [fetcher, interval, formatter]);

    return <span>{data}</span>;
}

export default LiveField;
