// src/app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { RichContent } from "@/components/RichContent";

export const dynamic = "force-dynamic";

const ABOUT_CONTENT = `
# Discipleship By Design Methodology™

## Do We Teach Students or The Bible?

The age old question regarding Christian Education is whether our job is to teach students or the Bible. Should we be student-centered or bible-centered?  

The answer to both of those questions is **yes**.

The goal of Christian Education is to teach students the Bible in a way that impacts how they think, believe, and behave. Teaching should be transformative. To transform, teaching has to be intentional.

The goal of Discipleship By Design is to assist teachers in bringing an intentional approach to the classroom.

---

## Core Convictions

- Discipleship is formation, not information.  
- Teaching must move from understanding to transformation.  
- Learning must engage head, heart, and hands.  

---

## The Three Movements of Every Lesson

The educational theory undergirding the three movements of every lesson is based on Bloom’s Revised Taxonomy. The goal is to categorize the movements of the class in a way that allows the teacher to anticipate and evaluate student progression toward deeper levels of learning.

This allows teachers to approach the classroom with confidence and leave with clarity.

### Inform – Clarify truth  
Bloom: *Remember, Understand*  
This deals with recall and understanding. At this level teachers are sharing the facts and leading students toward understanding.

### Inspire – Connect truth to life  
Bloom: *Apply, Analyze*  
This deals with application and analysis. At this level teachers are facilitating discussion to help students think about how what they now understand applies to them and where they can apply it in their lives.

### Involve – Confirm transformation and invite creation  
Bloom: *Evaluate, Create*  
This is where evaluation and creation happens. The teacher is now ready to assess the class’s learning by involving them in the learning process.

---

## Bloom’s Taxonomy Mapping

| Discipleship by Design Movement | Bloom’s Categories | Summary |
|---|---|---|
| Inform | Remember, Understand | Clarify truth and lead toward understanding |
| Inspire | Apply, Analyze | Connect truth to life and encourage discussion |
| Involve | Evaluate, Create | Invite ownership, evaluation, and creation |

---

## The Three Dimensions of Objective

Each lesson must have clear objectives, and because students are beings of mind, soul, and body, learning should impact every dimension of the learner.

### Head – What must they understand?

### Heart – What must they value?

### Hands – What must they practice?
`;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C6A75E]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* top bar */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image
                src="/dd-logo.png"
                alt="Discipleship by Design"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-white/60">
                Discipleship by Design
              </div>
              <div className="font-semibold tracking-tight text-[#C6A75E]">
                About
              </div>
            </div>
          </div>

          <Link
            href="/intake"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
          >
            Back to Intake
          </Link>
        </div>

        {/* content */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <RichContent markdown={ABOUT_CONTENT} />
        </div>

        <footer className="pt-10 pb-6 text-center text-xs text-white/40">
          Discipleship by Design · Teach With Intention
        </footer>
      </div>
    </main>
  );
}
