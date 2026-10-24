import Link from "next/link";
import { MarkIcon } from "./icons";
export const GITHUB_URL = "https://github.com/muhfajri24/Citezy";
export function Brand() {
    return <Link href="/" aria-label="Citezy home" className="brand"><MarkIcon /><span>citezy<span className="brand-dot">.</span></span></Link>;
}
