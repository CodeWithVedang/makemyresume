"use client";

import { useState, type ReactNode } from "react";

import { Field } from "@/components/forms/Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Base = {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  className,
  ...rest
}: Base & Omit<React.ComponentProps<"input">, "value" | "onChange" | "className">) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional} className={className}>
      {(p) => <Input {...p} {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 sm:h-10" />}
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  className,
  rows = 5,
  maxLength,
  placeholder,
}: Base & { rows?: number; maxLength?: number; placeholder?: string }) {
  return (
    <Field
      label={label}
      error={error}
      optional={optional}
      className={className}
      hint={
        hint || maxLength ? (
          <span className="flex justify-between gap-2">
            <span>{hint}</span>
            {maxLength ? (
              <span className="tabular-nums">
                {value.length}/{maxLength}
              </span>
            ) : null}
          </span>
        ) : undefined
      }
    >
      {(p) => (
        <Textarea
          {...p}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-28 text-[15px] leading-relaxed sm:text-sm"
        />
      )}
    </Field>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const selectClass =
  "h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive sm:h-10 dark:bg-input/30";

/**
 * Month + year selects. Works everywhere (unlike <input type="month">) and is
 * easy to use on phones. Emits "YYYY-MM" once both parts are chosen.
 */
export function MonthInput({
  label,
  value,
  onChange,
  error,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [partial, setPartial] = useState<{ y: string; m: string } | null>(null);
  const [vy = "", vm = ""] = value ? value.split("-") : [];
  const y = partial?.y ?? vy;
  const m = partial?.m ?? vm;
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear + 6 - 1960 }, (_, i) => String(thisYear + 5 - i));

  const set = (next: { y: string; m: string }) => {
    if (next.y && next.m) {
      setPartial(null);
      onChange(`${next.y}-${next.m}`);
    } else if (!next.y && !next.m) {
      setPartial(null);
      onChange("");
    } else {
      setPartial(next);
      if (value) onChange("");
    }
  };

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-1.5", className)} disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-[1fr_1.2fr] gap-2">
        <select
          aria-label={`${label} month`}
          className={selectClass}
          value={m}
          aria-invalid={error ? true : undefined}
          onChange={(e) => set({ y, m: e.target.value })}
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, "0")}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} year`}
          className={selectClass}
          value={y}
          aria-invalid={error ? true : undefined}
          onChange={(e) => set({ y: e.target.value, m })}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : partial ? (
        <p className="text-xs text-muted-foreground">Choose both month and year.</p>
      ) : null}
    </fieldset>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export const DESCRIPTION_HINT = "Start a line with “-” to create a bullet point.";
