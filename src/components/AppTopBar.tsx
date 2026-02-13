import Image from "next/image";
import Link from "next/link";
import { AppMenu } from "@/components/AppMenu";

export function AppTopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black">
            <Image
              src="/dd-logo.png"
              alt="Discipleship by Design"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm text-white/60">Discipleship by Design</div>
            <div className="text-xs text-white/40">
              Blueprints for Disciple-Making
            </div>
          </div>
        </Link>

        <AppMenu />
      </div>
    </div>
  );
}
