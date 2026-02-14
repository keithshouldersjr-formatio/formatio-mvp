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

type FlowItem = { segment: string; minutes: number; purpose: string };

function safeFlow(v: unknown): FlowItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (x): x is FlowItem =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as FlowItem).segment === "string" &&
        typeof (x as FlowItem).minutes === "number" &&
        typeof (x as FlowItem).purpose === "string",
    )
    .slice(0, 16);
}

type BloomObjective = { level: string; objective: string; evidence: string };

type TeacherModule = {
  prepChecklist?: { beforeTheWeek?: string[]; dayOf?: string[] };
  lessonPlan?: {
    planType?: string;
    sessions?: Array<{
      title?: string;
      durationMinutes?: number;
      flow?: unknown;
    }>;
  };
  facilitationPrompts?: {
    openingQuestions?: string[];
    discussionQuestions?: string[];
    applicationPrompts?: string[];
  };
  followUpPlan?: { sameWeekPractice?: string[]; nextTouchpoint?: string[] };
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readBlooms(overview: unknown): BloomObjective[] {
  if (!isRecord(overview)) return [];

  const candidate =
    overview["bloomsObjectives"] ??
    overview["bloomObjectives"] ??
    overview["blooms"];

  if (!Array.isArray(candidate)) return [];

  return candidate
    .filter(isRecord)
    .map((b) => ({
      level: safeStr(b["level"], ""),
      objective: safeStr(b["objective"], ""),
      evidence: safeStr(b["evidence"], ""),
    }))
    .filter((b) => b.level || b.objective || b.evidence);
}

function readTeacher(modules: unknown): TeacherModule | null {
  if (!isRecord(modules)) return null;

  const candidate = modules["teacher"] ?? modules["teacherModule"];
  if (!isRecord(candidate)) return null;

  // We keep it loose and let safeArr/safeStr handle missing fields.
  return candidate as unknown as TeacherModule;
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

  const execSummary = safeStr(
    overview?.executiveSummary,
    "No summary available.",
  );
  const formationGoal = safeStr(
    overview?.outcomes?.formationGoal,
    "No formation goal provided.",
  );
  const indicators = safeArr(overview?.outcomes?.measurableIndicators);

  const blooms = readBlooms(overview);
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

        {/* Executive Summary */}
        <View style={styles.section}>
          <SectionTitle title="Executive Summary" />
          <View style={styles.card}>
            <Text style={styles.paragraph}>{execSummary}</Text>
          </View>
        </View>

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

        {/* Bloom’s Objectives */}
        <View style={styles.section}>
          <SectionTitle title="Bloom’s Objectives" />
          <View style={styles.card}>
            {blooms.length ? (
              blooms.slice(0, 10).map((b, i) => (
                <View key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
                  <Text style={styles.h3}>
                    {safeStr(b?.level, `Objective ${i + 1}`)}
                  </Text>
                  <Text style={styles.paragraph}>
                    {safeStr(b?.objective, "—")}
                  </Text>
                  <Text style={[styles.small, { marginTop: 3 }]}>
                    Evidence: {safeStr(b?.evidence, "—")}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.paragraph, styles.muted]}>
                No Bloom objectives were provided.
              </Text>
            )}
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

          {/* Prep Checklist */}
          <View style={styles.section}>
            <SectionTitle title="Prep Checklist" />
            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Before the week</Text>
                <BulletList
                  items={safeArr(teacher?.prepChecklist?.beforeTheWeek)}
                  emptyText="No items provided."
                />
              </View>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Day of</Text>
                <BulletList
                  items={safeArr(teacher?.prepChecklist?.dayOf)}
                  emptyText="No items provided."
                />
              </View>
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
                teacher.lessonPlan.sessions.slice(0, 10).map((s, i) => {
                  const flow = safeFlow(s?.flow);
                  return (
                    <View key={i} style={styles.sessionCard}>
                      <Text style={styles.sessionTitle}>
                        {safeStr(s?.title, `Session ${i + 1}`)}
                      </Text>
                      <Text style={styles.small}>
                        Duration:{" "}
                        {typeof s?.durationMinutes === "number"
                          ? `${s.durationMinutes} min`
                          : "—"}
                      </Text>

                      {flow.length ? (
                        <View style={{ marginTop: 8 }}>
                          {flow.map((f, idx) => (
                            <View key={idx} style={{ marginTop: 6 }}>
                              <Text style={styles.h3}>
                                {safeStr(f.segment, "Segment")} ·{" "}
                                {typeof f.minutes === "number"
                                  ? `${f.minutes} min`
                                  : "—"}
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

          {/* Facilitation Prompts */}
          <View style={styles.section}>
            <SectionTitle title="Facilitation Prompts" />
            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Opening questions</Text>
                <BulletList
                  items={safeArr(
                    teacher?.facilitationPrompts?.openingQuestions,
                  )}
                  emptyText="No opening questions provided."
                />
              </View>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Discussion questions</Text>
                <BulletList
                  items={safeArr(
                    teacher?.facilitationPrompts?.discussionQuestions,
                  )}
                  emptyText="No discussion questions provided."
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.h3}>Application prompts</Text>
              <BulletList
                items={safeArr(
                  teacher?.facilitationPrompts?.applicationPrompts,
                )}
                emptyText="No application prompts provided."
              />
            </View>
          </View>

          {/* Follow-up Plan */}
          <View style={styles.section}>
            <SectionTitle title="Follow-up Plan" />
            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Same-week practice</Text>
                <BulletList
                  items={safeArr(teacher?.followUpPlan?.sameWeekPractice)}
                  emptyText="No same-week practice provided."
                />
              </View>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Next touchpoint</Text>
                <BulletList
                  items={safeArr(teacher?.followUpPlan?.nextTouchpoint)}
                  emptyText="No next touchpoint provided."
                />
              </View>
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
