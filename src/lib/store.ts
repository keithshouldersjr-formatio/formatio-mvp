import type { Playbook } from "./schema";

const playbooks = new Map<string, Playbook>();

export function savePlaybook(pb: Playbook) {
  const id = crypto.randomUUID();
  playbooks.set(id, pb);
  return id;
}

export function getPlaybook(id: string) {
  return playbooks.get(id) ?? null;
}