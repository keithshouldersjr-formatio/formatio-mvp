import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Image
          src="/dd-logo.png"
          alt="dd logo"
          width={220}
          height={220}
          priority
        />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Discipleship Design
        </h1>

        <p className="mt-3 max-w-xl text-lg text-white/80">
          Discipleship By Design
        </p>

        {/* CTA Button */}

        <Link
          href="/intake"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#e1b369] px-10 py-3 text-black font-semibold tracking-wide transition hover:bg-[#B89A4E]"
        >
          Begin Designing
        </Link>
      </div>
    </main>
  );
}
