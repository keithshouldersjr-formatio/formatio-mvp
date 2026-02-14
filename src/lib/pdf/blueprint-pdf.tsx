import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  type DocumentProps,
  Link,
} from "@react-pdf/renderer";
import type { Blueprint } from "@/lib/schema";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  meta: { fontSize: 10, color: "#555", marginBottom: 10 },
  section: { marginTop: 14 },
  h2: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 10,
  },
  p: { lineHeight: 1.35 },
  li: { marginTop: 3, lineHeight: 1.25 },
  muted: { color: "#777" },
  grid2: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#444",
  },
  session: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  sessionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  small: { fontSize: 9, color: "#666" },
  link: { color: "#0b57d0", fontSize: 10 },
});

function safeStr(v: unknown, fallback = ""): string {
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
    .slice(0, 12);
}

function BulletList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText?: string;
}) {
  if (!items.length) {
    return <Text style={[styles.p, styles.muted]}>{emptyText ?? "—"}</Text>;
  }
  return (
    <>
      {items.map((it, i) => (
        <Text key={i} style={styles.li}>
          • {it}
        </Text>
      ))}
    </>
  );
}

export function buildBlueprintPdfDocument(
  blueprint: Blueprint,
): React.ReactElement<DocumentProps> {
  const header = blueprint.header;
  const overview = blueprint.overview;

  const title = safeStr(header?.title, "Discipleship by Design Blueprint");
  const track = safeStr(header?.role, "—");
  const leaderName = safeStr(header?.preparedFor?.leaderName, "—");
  const groupName = safeStr(header?.preparedFor?.groupName, "—");

  const execSummary = safeStr(
    overview?.executiveSummary,
    "No summary available.",
  );

  const formationGoal = safeStr(
    overview?.outcomes?.formationGoal,
    "No formation goal provided.",
  );

  const indicators = safeArr(overview?.outcomes?.measurableIndicators);
  const blooms = Array.isArray(overview?.bloomsObjectives)
    ? overview.bloomsObjectives
    : [];

  // Teacher module (MVP-safe)
  const teacher = blueprint.modules?.teacher ?? null;

  // Resources
  const resources = Array.isArray(blueprint.recommendedResources)
    ? blueprint.recommendedResources
    : [];

  return (
    <Document>
      {/* -----------------------------
          Page 1: Overview
      ------------------------------ */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.pillRow}>
          <Text style={styles.pill}>Track: {track}</Text>
          <Text style={styles.pill}>Prepared for: {leaderName}</Text>
          <Text style={styles.pill}>Group: {groupName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Executive Summary</Text>
          <View style={styles.card}>
            <Text style={styles.p}>{execSummary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Formation Goal</Text>
          <View style={styles.card}>
            <Text style={styles.p}>{formationGoal}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Measurable Indicators</Text>
          <View style={styles.card}>
            <BulletList
              items={indicators}
              emptyText="No indicators were provided."
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Bloom’s Objectives</Text>
          <View style={styles.card}>
            {blooms.length ? (
              blooms.slice(0, 6).map((b, i) => (
                <View key={i} style={{ marginTop: i === 0 ? 0 : 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: 700 }}>
                    {safeStr(b?.level, `Objective ${i + 1}`)}
                  </Text>
                  <Text style={styles.p}>{safeStr(b?.objective, "—")}</Text>
                  <Text style={[styles.small, { marginTop: 2 }]}>
                    Evidence: {safeStr(b?.evidence, "—")}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.p, styles.muted]}>
                No Bloom objectives were provided.
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.meta, styles.muted]}>
            Teach With Intent· {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>

      {/* -----------------------------
          Page 2: Teacher Module (only if present)
      ------------------------------ */}
      {teacher ? (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.title}>Teacher Module</Text>
          <Text style={styles.meta}>
            Practical prep + facilitation prompts for a strong class session.
          </Text>

          {/* Prep checklists */}
          <View style={styles.section}>
            <Text style={styles.h2}>Prep Checklist</Text>

            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Before the week</Text>
                <BulletList
                  items={safeArr(teacher.prepChecklist?.beforeTheWeek)}
                  emptyText="No items provided."
                />
              </View>

              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Day of</Text>
                <BulletList
                  items={safeArr(teacher.prepChecklist?.dayOf)}
                  emptyText="No items provided."
                />
              </View>
            </View>
          </View>

          {/* Lesson plan sessions */}
          <View style={styles.section}>
            <Text style={styles.h2}>Lesson Plan</Text>
            <View style={styles.card}>
              <Text style={styles.small}>
                Plan type: {safeStr(teacher.lessonPlan?.planType, "—")}
              </Text>

              {Array.isArray(teacher.lessonPlan?.sessions) &&
              teacher.lessonPlan.sessions.length ? (
                teacher.lessonPlan.sessions.slice(0, 8).map((s, i) => {
                  const flow = safeFlow(s?.flow);
                  return (
                    <View key={i} style={styles.session}>
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
                        <View style={{ marginTop: 6 }}>
                          {flow.map((f, idx) => (
                            <View key={idx} style={{ marginTop: 4 }}>
                              <Text style={{ fontSize: 10, fontWeight: 700 }}>
                                {safeStr(f.segment, "Segment")} ·{" "}
                                {typeof f.minutes === "number"
                                  ? `${f.minutes} min`
                                  : "—"}
                              </Text>
                              <Text style={styles.p}>
                                {safeStr(f.purpose, "—")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text
                          style={[styles.p, styles.muted, { marginTop: 6 }]}
                        >
                          No session flow provided.
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.p, styles.muted, { marginTop: 8 }]}>
                  No sessions were provided.
                </Text>
              )}
            </View>
          </View>

          {/* Facilitation prompts */}
          <View style={styles.section}>
            <Text style={styles.h2}>Facilitation Prompts</Text>

            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Opening questions</Text>
                <BulletList
                  items={safeArr(teacher.facilitationPrompts?.openingQuestions)}
                  emptyText="No opening questions provided."
                />
              </View>

              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Discussion questions</Text>
                <BulletList
                  items={safeArr(
                    teacher.facilitationPrompts?.discussionQuestions,
                  )}
                  emptyText="No discussion questions provided."
                />
              </View>
            </View>

            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.h3}>Application prompts</Text>
              <BulletList
                items={safeArr(teacher.facilitationPrompts?.applicationPrompts)}
                emptyText="No application prompts provided."
              />
            </View>
          </View>

          {/* Follow up */}
          <View style={styles.section}>
            <Text style={styles.h2}>Follow-up Plan</Text>
            <View style={styles.grid2}>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Same-week practice</Text>
                <BulletList
                  items={safeArr(teacher.followUpPlan?.sameWeekPractice)}
                  emptyText="No same-week practice provided."
                />
              </View>
              <View style={[styles.card, styles.col]}>
                <Text style={styles.h3}>Next touchpoint</Text>
                <BulletList
                  items={safeArr(teacher.followUpPlan?.nextTouchpoint)}
                  emptyText="No next touchpoint provided."
                />
              </View>
            </View>
          </View>
        </Page>
      ) : null}

      {/* -----------------------------
          Page 3: Resources (only if present)
      ------------------------------ */}
      {resources.length ? (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.title}>Recommended Resources</Text>
          <Text style={styles.meta}>
            A short stack to deepen your practice and sharpen your plan.
          </Text>

          <View style={styles.section}>
            {resources.slice(0, 8).map((r, i) => (
              <View
                key={i}
                style={[styles.card, { marginTop: i === 0 ? 0 : 10 }]}
              >
                <Text style={{ fontSize: 11, fontWeight: 700 }}>
                  {safeStr(r?.title, "Untitled Resource")}
                </Text>
                <Text style={styles.small}>
                  {safeStr(r?.author, "—")} · {safeStr(r?.publisher, "—")}
                </Text>

                <View style={{ marginTop: 6 }}>
                  {safeStr(r?.amazonUrl) ? (
                    <Text style={styles.small}>
                      Amazon:{" "}
                      <Link src={safeStr(r.amazonUrl)} style={styles.link}>
                        {safeStr(r.amazonUrl)}
                      </Link>
                    </Text>
                  ) : null}

                  {safeStr(r?.publisherUrl) ? (
                    <Text style={styles.small}>
                      Publisher:{" "}
                      <Link src={safeStr(r.publisherUrl)} style={styles.link}>
                        {safeStr(r.publisherUrl)}
                      </Link>
                    </Text>
                  ) : null}
                </View>

                <Text style={[styles.p, { marginTop: 8 }]}>
                  {safeStr(r?.whyThisHelps, "—")}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      ) : null}
    </Document>
  );
}
