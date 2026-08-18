"use client";

import Select from "@/components/admin/ui/Select";
import { buildTimeSlotOptions } from "@/lib/utils/appointment-interval";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  interval?: unknown;
  start?: string;
  end?: string;
  disabled?: boolean;
}

export default function TimeSelect({
  label,
  value,
  onChange,
  interval = 60,
  start = "08:00",
  end = "23:00",
  disabled,
}: Props) {
  const options = buildTimeSlotOptions({
    interval,
    start,
    end,
    include: value,
  });

  if (!value) {
    options.unshift({ value: "", label: "—" });
  }

  return (
    <Select
      label={label}
      value={value}
      disabled={disabled}
      options={options}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
