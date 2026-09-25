import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return <header className="nav-wrap"><nav className="nav" aria-label="Main navigation">
    <Link className="brand" href="#top" aria-label="Clario home"><Image src="/logo.png" alt="Clario" width={108} height={64} priority /></Link>
    <div className="nav-links"><Link href="#features">Features</Link><Link href="#workflow">How it works</Link><Link href="#about">About</Link></div>
    <div className="nav-actions"><Link className="sign-in" href="/signin">Sign in</Link><Link className="button button-small" href="/signup">Sign up <span>↗</span></Link></div>
  </nav></header>;
}
