// src/lib/pdf/blueprint-pdf.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { Blueprint } from "@/lib/schema";

/* ----------------------------------
   Brand Colors
----------------------------------- */

const GOLD = "#C6A75E";
const DARK = "#0B0B0C";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";
const MUTED_DARK = "#6B7280";

/* ----------------------------------
   Styles
----------------------------------- */

const styles = StyleSheet.create({
  /* ===== COVER PAGE ===== */
  coverPage: {
    padding: 60,
    backgroundColor: DARK,
    color: "#FFFFFF",
    justifyContent: "center",
  },

  coverLogoWrap: {
    alignItems: "center",
    marginBottom: 30,
  },

  coverLogo: {
    width: 70,
    height: 70,
    marginBottom: 20,
  },

  coverTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
    marginBottom: 10,
  },

  coverSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 30,
  },

  coverMeta: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 6,
  },

  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 10,
    opacity: 0.5,
  },

  /* ===== INTERIOR PAGES ===== */
  page: {
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 50,
    backgroundColor: "#FFFFFF",
    color: TEXT_DARK,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  header: {
    position: "absolute",
    top: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED_DARK,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED_DARK,
  },

  title: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 6,
  },

  section: {
    marginTop: 18,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionBar: {
    width: 4,
    height: 14,
    backgroundColor: GOLD,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
  },

  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },

  paragraph: {
    lineHeight: 1.5,
  },

  muted: {
    color: MUTED_DARK,
  },

  bulletRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: GOLD,
    marginTop: 4,
    marginRight: 8,
  },

  bulletText: {
    flex: 1,
    lineHeight: 1.4,
  },

  resourceCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },

  link: {
    fontSize: 9,
    color: "#2563EB",
  },

  h3: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },

  small: {
    fontSize: 9,
    color: MUTED_DARK,
  },

  grid2: {
    flexDirection: "row",
    gap: 10,
  },

  col: {
    flex: 1,
  },

  grid3: {
    flexDirection: "row",
    gap: 10,
  },

  sessionCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },

  sessionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT_DARK,
  },

  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },

  tag: {
    fontSize: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    color: MUTED_DARK,
  },

  movementLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: GOLD,
  },

  engagementStack: {
    gap: 10,
  },

  engagementRow: {
    flexDirection: "row",
    gap: 10,
  },

  engagementLabelBox: {
    width: 110, // tweak as needed
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },

  engagementLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 4,
  },

  engagementSub: {
    fontSize: 9,
    color: MUTED_DARK,
    lineHeight: 1.3,
  },

  engagementBody: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
});

/* ----------------------------------
   Helpers
----------------------------------- */

function safeStr(v: unknown, fallback = "—"): string {
  return typeof v === "string" && v.trim().length ? v : fallback;
}

function safeArr(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

type DbdMovement = "Inform" | "Inspire" | "Involve";

type FlowItem = {
  segment: string;
  minutes: number;
  purpose: string;
  movement: DbdMovement;
};

function safeMovement(v: unknown): DbdMovement | null {
  if (v === "Inform" || v === "Inspire" || v === "Involve") return v;
  return null;
}

function readGrowthMeasures(outcomes: unknown): string[] {
  if (typeof outcomes !== "object" || outcomes === null) return [];
  const o = outcomes as Record<string, unknown>;

  const howTo = safeArr(o["howToMeasureGrowth"]);
  if (howTo.length) return howTo;

  const legacy = safeArr(o["measurableIndicators"]);
  if (legacy.length) return legacy;

  return [];
}

function safeFlow(v: unknown): FlowItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (x): x is FlowItem =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as FlowItem).segment === "string" &&
        typeof (x as FlowItem).minutes === "number" &&
        typeof (x as FlowItem).purpose === "string" &&
        safeMovement((x as FlowItem).movement) !== null,
    )
    .slice(0, 20);
}

type Engagement = { inform: string[]; inspire: string[]; involve: string[] };

function safeEngagement(v: unknown): Engagement | null {
  if (!isRecord(v)) return null;

  const inform = safeArr(v["inform"]);
  const inspire = safeArr(v["inspire"]);
  const involve = safeArr(v["involve"]);

  if (!inform.length || !inspire.length || !involve.length) return null;
  return { inform, inspire, involve };
}

type TeacherModule = {
  // NEW shape:
  prepChecklist?: string[] | { beforeTheWeek?: string[]; dayOf?: string[] };

  lessonPlan?: {
    planType?: string;
    sessions?: Array<{
      title?: string;
      durationMinutes?: number;
      objectives?: unknown;
      engagement?: unknown;
      flow?: unknown;
    }>;
  };

  // legacy (some old rows may still have it)
  followUpPlan?: { sameWeekPractice?: string[]; nextTouchpoint?: string[] };
};

function readTeacher(modules: unknown): TeacherModule | null {
  if (!isRecord(modules)) return null;

  const candidate = modules["teacher"];
  if (!isRecord(candidate)) return null;

  return candidate as unknown as TeacherModule;
}

function readPrepChecklist(v: unknown): string[] {
  // new format: string[]
  if (Array.isArray(v)) return safeArr(v);

  // legacy format: { beforeTheWeek, dayOf }
  if (isRecord(v)) {
    const before = safeArr(v["beforeTheWeek"]);
    const dayOf = safeArr(v["dayOf"]);
    return [...before, ...dayOf].filter(Boolean);
  }

  return [];
}

function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && env.startsWith("http")) return env.replace(/\/+$/, "");
  // fallback so the logo always works in prod
  return "https://www.discipleship.design";
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function BulletList({
  items,
  emptyText = "—",
}: {
  items: string[];
  emptyText?: string;
}) {
  if (!items.length)
    return <Text style={[styles.paragraph, styles.muted]}>{emptyText}</Text>;

  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

function EngagementCard({ e }: { e: Engagement | null }) {
  if (!e) {
    return (
      <Text style={[styles.paragraph, styles.muted]}>
        No engagement plan provided.
      </Text>
    );
  }

  return (
    <View style={styles.engagementStack}>
      {/* Inform row */}
      <View style={styles.engagementRow}>
        <View style={styles.engagementLabelBox}>
          <Text style={styles.engagementLabel}>Inform</Text>
          <Text style={styles.engagementSub}>
            Clarify truth (recall + understanding)
          </Text>
        </View>
        <View style={styles.engagementBody}>
          <BulletList items={e.inform} emptyText="—" />
        </View>
      </View>

      {/* Inspire row */}
      <View style={styles.engagementRow}>
        <View style={styles.engagementLabelBox}>
          <Text style={styles.engagementLabel}>Inspire</Text>
          <Text style={styles.engagementSub}>
            Connect truth to life (apply + analyze)
          </Text>
        </View>
        <View style={styles.engagementBody}>
          <BulletList items={e.inspire} emptyText="—" />
        </View>
      </View>

      {/* Involve row */}
      <View style={styles.engagementRow}>
        <View style={styles.engagementLabelBox}>
          <Text style={styles.engagementLabel}>Involve</Text>
          <Text style={styles.engagementSub}>
            Confirm growth + invite creation (evaluate + create)
          </Text>
        </View>
        <View style={styles.engagementBody}>
          <BulletList items={e.involve} emptyText="—" />
        </View>
      </View>
    </View>
  );
}

/* ----------------------------------
   Main Builder
----------------------------------- */

export function buildBlueprintPdfDocument(
  blueprint: Blueprint,
): React.ReactElement<DocumentProps> {
  const header = blueprint.header;
  const overview = blueprint.overview;

  const title = safeStr(header?.title, "Blueprint");
  const role = safeStr(header?.role);
  const leader = safeStr(header?.preparedFor?.leaderName);
  const group = safeStr(header?.preparedFor?.groupName);

  const formationGoal = safeStr(
    overview?.outcomes?.formationGoal,
    "No formation goal provided.",
  );
  const indicators = readGrowthMeasures(overview?.outcomes);

  const teacher = readTeacher(blueprint.modules);

  const resources = Array.isArray(blueprint.recommendedResources)
    ? blueprint.recommendedResources
    : [];

  const siteUrl = getSiteUrl();

  return (
    <Document>
      {/* ===========================
          COVER PAGE (dark)
      ============================ */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverLogoWrap}>
          {/* ✅ Yes: you can print your logo on the cover page */}
          <Image src={`${siteUrl}/dd-logo.png`} style={styles.coverLogo} />
        </View>

        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>
          Discipleship by Design Blueprint
        </Text>

        <Text style={styles.coverMeta}>Role: {role}</Text>
        <Text style={styles.coverMeta}>Leader: {leader}</Text>
        <Text style={styles.coverMeta}>Group: {group}</Text>

        <Text style={styles.coverFooter}>
          Teach With Intention · Generated {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* ===========================
          OVERVIEW PAGE (white)
      ============================ */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text>Discipleship by Design</Text>
          <Text>{group}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Teach With Intention</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

        <Text style={styles.title}>{title}</Text>

        {/* Formation Goal */}
        <View style={styles.section}>
          <SectionTitle title="Formation Goal" />
          <View style={styles.card}>
            <Text style={styles.paragraph}>{formationGoal}</Text>
          </View>
        </View>

        {/* Indicators */}
        <View style={styles.section}>
          <SectionTitle title="Measurable Indicators" />
          <View style={styles.card}>
            <BulletList
              items={indicators}
              emptyText="No indicators provided."
            />
          </View>
        </View>

        {/* Method snapshot */}
        <View style={styles.section}>
          <SectionTitle title="The Three Movements" />
          <View style={styles.card}>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>Inform — clarify truth</Text>
              <Text style={styles.tag}>Inspire — connect truth to life</Text>
              <Text style={styles.tag}>
                Involve — confirm growth + invite creation
              </Text>
            </View>
            <Text style={[styles.paragraph, { marginTop: 8 }]}>
              Each session uses these three movements so volunteers can teach
              with confidence and leave with clarity.
            </Text>
          </View>
        </View>
      </Page>

      {/* ===========================
          TEACHER MODULE PAGE (white, optional)
      ============================ */}
      {teacher ? (
        <Page size="LETTER" style={styles.page}>
          {/* Header */}
          <View style={styles.header} fixed>
            <Text>Discipleship by Design</Text>
            <Text>{group}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Teach With Intention</Text>
            <Text
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>

          <Text style={styles.title}>Teacher Module</Text>

          {/* Prep Checklist (single consolidated list) */}
          <View style={styles.section}>
            <SectionTitle title="Prep Checklist" />
            <View style={styles.card}>
              <BulletList
                items={readPrepChecklist(teacher?.prepChecklist)}
                emptyText="No prep checklist provided."
              />
            </View>
          </View>

          {/* Lesson Plan */}
          <View style={styles.section}>
            <SectionTitle title="Lesson Plan" />
            <View style={styles.card}>
              <Text style={styles.small}>
                Plan type: {safeStr(teacher?.lessonPlan?.planType, "—")}
              </Text>

              {Array.isArray(teacher?.lessonPlan?.sessions) &&
              teacher.lessonPlan.sessions.length ? (
                teacher.lessonPlan.sessions.slice(0, 12).map((s, i) => {
                  const flow = safeFlow(s?.flow);
                  const engagement = safeEngagement(s?.engagement);

                  const duration =
                    typeof s?.durationMinutes === "number"
                      ? `${s.durationMinutes} min`
                      : "—";

                  return (
                    <View key={i} style={styles.sessionCard}>
                      <Text style={styles.sessionTitle}>
                        {safeStr(s?.title, `Session ${i + 1}`)}
                      </Text>
                      <Text style={styles.small}>Duration: {duration}</Text>

                      {/* Session engagement */}
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.h3}>
                          Engagement (Inform · Inspire · Involve)
                        </Text>
                        <View style={{ marginTop: 6 }}>
                          <EngagementCard e={engagement} />
                        </View>
                      </View>

                      {/* Session flow */}
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.h3}>Session Flow</Text>
                        <Text style={styles.small}>
                          Minutes should sum to the session duration. Each
                          segment is tagged.
                        </Text>

                        {flow.length ? (
                          <View style={{ marginTop: 8 }}>
                            {flow.map((f, idx) => (
                              <View key={idx} style={{ marginTop: 8 }}>
                                <Text style={styles.movementLabel}>
                                  {safeStr(f.movement)}{" "}
                                  <Text style={styles.small}>
                                    · {safeStr(f.segment, "Segment")} ·{" "}
                                    {typeof f.minutes === "number"
                                      ? `${f.minutes} min`
                                      : "—"}
                                  </Text>
                                </Text>
                                <Text style={styles.paragraph}>
                                  {safeStr(f.purpose, "—")}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.paragraph,
                              styles.muted,
                              { marginTop: 8 },
                            ]}
                          >
                            No session flow provided.
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={[styles.paragraph, styles.muted, { marginTop: 8 }]}
                >
                  No sessions were provided.
                </Text>
              )}
            </View>
          </View>
        </Page>
      ) : null}

      {/* ===========================
          RESOURCES PAGE (white, optional)
      ============================ */}
      {resources.length > 0 ? (
        <Page size="LETTER" style={styles.page}>
          {/* Header */}
          <View style={styles.header} fixed>
            <Text>Discipleship by Design</Text>
            <Text>{group}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Teach With Intention</Text>
            <Text
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>

          <Text style={styles.title}>Recommended Resources</Text>

          <View style={styles.section}>
            {resources.slice(0, 12).map((r, i) => (
              <View key={i} style={styles.resourceCard}>
                <Text style={{ fontWeight: 700, color: GOLD }}>
                  {safeStr(r?.title, "Untitled Resource")}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {safeStr(r?.author)} · {safeStr(r?.publisher)}
                </Text>

                {r?.amazonUrl ? (
                  <Text style={{ marginTop: 4 }}>
                    <Link src={safeStr(r.amazonUrl)} style={styles.link}>
                      Amazon link
                    </Link>
                  </Text>
                ) : null}

                {r?.publisherUrl ? (
                  <Text style={{ marginTop: 2 }}>
                    <Link src={safeStr(r.publisherUrl)} style={styles.link}>
                      Publisher link
                    </Link>
                  </Text>
                ) : null}

                {r?.whyThisHelps ? (
                  <Text style={[styles.paragraph, { marginTop: 8 }]}>
                    {safeStr(r.whyThisHelps)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </Page>
      ) : null}
    </Document>
  );
}
