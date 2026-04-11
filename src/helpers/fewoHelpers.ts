import type { FeWo } from "../types";

export function getActiveFeWo(
  fewos: FeWo[],
  activeFeWoId: string
): FeWo {
  return fewos.find((f) => f.id === activeFeWoId) ?? fewos[0];
}
