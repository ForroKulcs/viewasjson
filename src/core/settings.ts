import { settings } from '@devvit/web/server';

export type ViewSettings = {
  space: string | number | undefined;
  sortKeys: boolean;
  includeOuterBraces: boolean;
  showUsernamesIn: string[];
};

const firstString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

const stringList = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const toSpace = (
  indentation: string | undefined
): string | number | undefined => {
  switch (indentation) {
    case 'tab':
      return '\t';
    case '1':
    case '2':
    case '4':
    case '8':
      return Number(indentation);
    default:
      return undefined;
  }
};

export const loadViewSettings = async (): Promise<ViewSettings> => {
  const all = await settings.getAll();
  return {
    space: toSpace(firstString(all['indentation'])),
    sortKeys: all['sortKeys'] === true,
    includeOuterBraces: all['includeOuterBraces'] !== false,
    showUsernamesIn: stringList(all['showUsernamesIn']),
  };
};
