import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Image
    className="relative"
    src="/formatio-logo.png"
    alt="Formatio logo"
    width={220}
    height={220}
    priority
  />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Formatio
        </h1>

        <p className="mt-3 max-w-xl text-balance text-lg text-white/80">
          Architecting Discipleship
        </p>
      </div>
    </main>
  );
}