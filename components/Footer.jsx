import Image from "next/image";
import Link from "next/link";
export default function Footer() { return <footer id="about"><div className="brand-footer"><Image src="/logo.png" width={70} height={35} alt="Clario"/></div><p>© 2026 Clario. Customer relationships, made clear.</p><div><Link href="#top">Privacy</Link><Link href="#top">Contact</Link></div></footer>; }
