import type { RuntimePlanSlide, SlotBinding } from './model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodePointer(pointer: string): string[] | null {
  if (!pointer.startsWith('/')) return null;
  const tokens = pointer.slice(1).split('/');
  for (const token of tokens) {
    if (/~(?:[^01]|$)/.test(token)) return null;
  }
  return tokens.map((token) => token.replace(/~1/g, '/').replace(/~0/g, '~'));
}

export function resolvePointer(document: unknown, pointer: string): unknown {
  const tokens = decodePointer(pointer);
  if (!tokens) return undefined;
  let current = document;
  for (const token of tokens) {
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(token)) return undefined;
      current = current[Number(token)];
    } else if (isRecord(current) && Object.prototype.hasOwnProperty.call(current, token)) {
      current = current[token];
    } else {
      return undefined;
    }
  }
  return current;
}

function projectFields(value: unknown, fields: string[]): unknown {
  const projectOne = (entry: unknown) => {
    if (!isRecord(entry)) return entry;
    return Object.fromEntries(
      fields.filter((field) => entry[field] !== undefined).map((field) => [field, entry[field]]),
    );
  };
  return Array.isArray(value) ? value.map(projectOne) : projectOne(value);
}

export function resolveBinding(document: unknown, binding: SlotBinding): unknown {
  const value = resolvePointer(document, binding.source_pointer);
  if (value === undefined) return undefined;
  switch (binding.transform) {
    case 'identity@1':
    case 'array_items@1':
      return value;
    case 'object_fields@1':
      return projectFields(value, binding.fields ?? []);
    case 'collect_ordered@1':
      return value;
    default:
      return undefined;
  }
}

export function resolveSlideSlots(
  document: unknown,
  slide: RuntimePlanSlide,
): Record<string, unknown> {
  return Object.fromEntries(
    slide.slot_bindings.map((binding) => [binding.slot_id, resolveBinding(document, binding)]),
  );
}
