// Simple in-memory metrics to track lightweight counters for development.
// For production, wire these to Prometheus, Datadog, etc.

type Counters = Record<string, number>;
const counters: Counters = {};

export function incrementCounter(name: string, value = 1) {
  counters[name] = (counters[name] ?? 0) + value;
}

export function getCounter(name: string) {
  return counters[name] ?? 0;
}

export function getAllCounters() {
  return { ...counters };
}

export default { incrementCounter, getCounter, getAllCounters };
