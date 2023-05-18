import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import nlBE from "date-fns/locale/nl-BE";

export default function LocaleDatePicker({
    selectedDate,
    setSelectedDate,
}: {
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
}) {
    return (
        <ReactDatePicker
            locale={nlBE}
            showIcon
            dateFormat="dd/MM/yyyy"
            selected={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
        />
    );
}
