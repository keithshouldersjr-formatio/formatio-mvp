import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { fetchPlaybookById } from "@/lib/playbook-repo";
import { buildPlaybookPdfDocument } from "@/lib/pdf/playbook-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfInstance = {
  toBuffer: () => Promise<Uint8Array>;
};

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const playbook = await fetchPlaybookById(id);
  if (!playbook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ✅ This returns an actual <Document/> element (not a component element)
  const doc = buildPlaybookPdfDocument(playbook);

  const instance = pdf(doc) as unknown as PdfInstance;
  const bytes = await instance.toBuffer();

  const filenameSafe =
    playbook.header.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() ||
    "playbook";

  return new NextResponse(toArrayBuffer(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="formatio-${filenameSafe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}