import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
function classes(...values: (string | undefined)[]) { return values.filter(Boolean).join(" "); }
export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type={type} className={classes("inline-flex min-h-11 items-center justify-center rounded-xl bg-lime px-5 py-2 font-semibold text-ink transition-colors hover:bg-[#a5df59] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}/>;
}
const field = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink placeholder:text-muted disabled:opacity-50";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={classes(field, className)} {...props}/>; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={classes(field, "min-h-28 resize-y", className)} {...props}/>; }
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={classes("rounded-2xl border border-border bg-surface p-6", className)} {...props}/>; }
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={classes("inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold", className)} {...props}/>; }
export function Alert({ className, role = "status", ...props }: HTMLAttributes<HTMLDivElement>) { return <div role={role} className={classes("rounded-xl border border-border bg-paper p-4 text-sm", className)} {...props}/>; }
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div aria-hidden="true" className={classes("h-5 animate-pulse rounded bg-border", className)} {...props}/>; }
