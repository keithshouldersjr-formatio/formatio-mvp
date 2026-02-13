import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Playbook } from "@/lib/schema";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  label: { fontSize: 9, color: "#666", marginTop: 10 },
  body: { fontSize: 11, lineHeight: 1.35, marginTop: 4 },
  card: { marginTop: 8, padding: 10, borderWidth: 1, borderColor: "#ddd" },
});

export function PlaybookPdf({ playbook }: { playbook: Playbook }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* If you see these lines, the PDF pipeline is working */}
        <Text style={styles.title}>{playbook.header.title}</Text>
        <Text>Track: {playbook.header.track}</Text>
        <Text>Prepared for: {playbook.header.preparedFor.leaderName}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Executive Summary</Text>
          <Text style={styles.body}>{playbook.overview.executiveSummary}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Formation Goal</Text>
          <Text style={styles.body}>
            {playbook.overview.outcomes.formationGoal}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>First Bloom Objective</Text>
          <Text style={styles.body}>
            {playbook.overview.bloomsObjectives[0]?.level}:{" "}
            {playbook.overview.bloomsObjectives[0]?.objective}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function buildPlaybookPdfDocument(playbook: Playbook) {
  return (
    <Document>
      <Page size="LETTER">
        <Text>{playbook.header.title}</Text>
      </Page>
    </Document>
  );
}
