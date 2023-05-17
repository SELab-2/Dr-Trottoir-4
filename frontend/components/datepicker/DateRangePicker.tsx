import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.min.css";
import React from "react";
import nlBE from "date-fns/locale/nl-BE";

export default function LocaleDateRangePicker(
    {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
    }: {
        startDate: Date | null,
        endDate: Date | null,
        setStartDate: (d: Date | null) => void,
        setEndDate: (d: Date | null) => void,
    }
) {

    return (
        <ReactDatePicker
            locale={nlBE}
            showIcon
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={([s, e]: [Date | null, Date | null]) => {
                setStartDate(s);
                setEndDate(e);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
        />
    );
}