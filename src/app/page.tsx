import Image from "next/image";
import Link from "next/link";
import { AppTopBar } from "@/components/AppTopBar";

export const runtime = "nodejs";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <AppTopBar />

      {/* Center area */}
      <div className="flex flex-1 items-center justify-center px-6">
        {/* Visual centering tweak */}
        <div className="w-full max-w-5xl text-center translate-y-24 md:translate-y-14">
          <div className="flex justify-center">
            <Image
              src="/dd-logo.png"
              alt="dd logo"
              width={220}
              height={220}
              priority
            />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Discipleship By Design
          </h1>

          <p className="mt-3 mx-auto max-w-xl text-lg text-white/80">
            Blueprints for Disciple-Making
          </p>

          <Link
            href="/intake"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#e1b369] px-10 py-3 text-black font-semibold tracking-wide transition hover:bg-[#B89A4E]"
          >
            Begin Designing
          </Link>
        </div>
      </div>
    </main>
  );
}
