import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { fetchBlueprintById } from "@/lib/blueprint-repo";
import { buildBlueprintPdfDocument } from "@/lib/pdf/blueprint-pdf";

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

  const blueprint = await fetchBlueprintById(id);
  if (!blueprint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = buildBlueprintPdfDocument(blueprint);

  const instance = pdf(doc) as unknown as PdfInstance;
  const bytes = await instance.toBuffer();
  const arrayBuffer = toArrayBuffer(bytes);

  const rawTitle = blueprint.header?.title ?? "blueprint";
  const filenameSafe =
    rawTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "blueprint";

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ddb-blueprint-${filenameSafe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}