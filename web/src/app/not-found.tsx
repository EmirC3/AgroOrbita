import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <p>Todavía no llegamos a esa zona.</p>
      <Link href="/">Elegir otra zona</Link>
    </main>
  );
}
