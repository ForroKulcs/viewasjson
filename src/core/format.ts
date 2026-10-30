export type JsonArea = 'subreddit' | 'user' | 'post' | 'comment';

export type FormatOptions = {
  sortKeys: boolean;
  outerBraces: boolean;
  clearPaths: string[];
  space: string | number | undefined;
};

export const USERNAME_PATHS: Record<JsonArea, string[]> = {
  subreddit: [],
  user: ['username'],
  post: ['authorName', 'removedBy', 'modReports[].author'],
  comment: ['authorName', 'modReports[].author'],
};

const clearPath = (node: unknown, segments: string[]): void => {
  const [head, ...rest] = segments;
  if (
    head === undefined ||
    node === null ||
    typeof node !== 'object' ||
    Array.isArray(node)
  ) {
    return;
  }

  const isList = head.endsWith('[]');
  const key = isList ? head.slice(0, -2) : head;
  const record = node as Record<string, unknown>;
  const value = record[key];

  if (rest.length === 0) {
    if (typeof value === 'string' && !value.startsWith('[')) record[key] = '';
    return;
  }

  if (isList) {
    if (Array.isArray(value)) {
      for (const item of value as unknown[]) clearPath(item, rest);
    }
  } else {
    clearPath(value, rest);
  }
};

const compareKeys = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item: unknown) => sortKeys(item));
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    entries.sort(([a], [b]) => compareKeys(a, b));
    return Object.fromEntries(entries.map(([k, v]) => [k, sortKeys(v)]));
  }

  return value;
};

const stripOuterBraces = (
  json: string,
  space: string | number | undefined
): string => {
  const indent = typeof space === 'number' ? ' '.repeat(space) : (space ?? '');
  if (indent === '') return json.slice(1, -1);

  return json
    .split('\n')
    .slice(1, -1)
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join('\n');
};

export const formatJson = (data: unknown, options: FormatOptions): string => {
  const text = JSON.stringify(data) as string | undefined;
  const plain: unknown = JSON.parse(text ?? 'null');

  for (const path of options.clearPaths) {
    clearPath(plain, path.split('.'));
  }

  const result = options.sortKeys ? sortKeys(plain) : plain;
  const json = JSON.stringify(result, null, options.space);

  const isObject =
    result !== null && typeof result === 'object' && !Array.isArray(result);
  if (options.outerBraces || !isObject) return json;

  return stripOuterBraces(json, options.space);
};
