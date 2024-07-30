import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatePicker({
  selectedDate,
  onChange,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
  minDate,
}) {
  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={onChange}
      selectsStart={selectsStart}
      selectsEnd={selectsEnd}
      startDate={startDate}
      endDate={endDate}
      minDate={minDate}
      dateFormat="yyyy-MM-dd"
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  );
}
