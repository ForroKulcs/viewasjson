import { Hono } from 'hono';
import { reddit } from '@devvit/web/server';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import { isT1, isT3, isT5 } from '@devvit/shared-types/tid.js';
import type { T2 } from '@devvit/shared-types/tid.js';
import { formatJson, USERNAME_PATHS } from '../core/format';
import type { JsonArea } from '../core/format';
import { loadViewSettings } from '../core/settings';

export const menu = new Hono();

const TITLES: Record<JsonArea, string> = {
  subreddit: 'View Subreddit as JSON',
  user: 'View User as JSON',
  post: 'View Post as JSON',
  comment: 'View Comment as JSON',
};

const toast = (text: string): UiResponse => ({ showToast: text });

const jsonDialog = async (
  area: JsonArea,
  data: unknown
): Promise<UiResponse> => {
  const viewSettings = await loadViewSettings();

  const json = formatJson(data, {
    sortKeys: viewSettings.sortKeys,
    outerBraces: viewSettings.includeOuterBraces,
    clearPaths: viewSettings.showUsernamesIn.includes(area)
      ? []
      : USERNAME_PATHS[area],
    space: viewSettings.space,
  });

  return {
    showForm: {
      name: 'jsonView',
      form: {
        title: TITLES[area],
        fields: [
          {
            name: 'json',
            label: 'JSON',
            type: 'paragraph',
            lineHeight: 20,
            defaultValue: json,
          },
        ],
        acceptLabel: 'Close',
      },
    },
  };
};

const loadObject = async (request: MenuItemRequest): Promise<unknown> => {
  const { location, targetId } = request;

  if (location === 'post' && isT3(targetId)) {
    return await reddit.getPostById(targetId);
  }

  if (location === 'comment' && isT1(targetId)) {
    const comment = await reddit.getCommentById(targetId);
    const { replies: _replies, ...rest } = comment.toJSON();
    return rest;
  }

  if (location === 'subreddit' && isT5(targetId)) {
    return await reddit.getSubredditInfoById(targetId);
  }

  throw new Error(`Unsupported target: ${location} ${targetId}`);
};

const getUser = async (authorId: T2 | undefined, authorName: string) => {
  if (authorId) return await reddit.getUserById(authorId);
  if (authorName && authorName !== '[deleted]') {
    return await reddit.getUserByUsername(authorName);
  }
  return undefined;
};

const loadAuthorRef = async (request: MenuItemRequest) => {
  const { location, targetId } = request;

  if (location === 'post' && isT3(targetId)) {
    const post = await reddit.getPostById(targetId);
    return { authorId: post.authorId, authorName: post.authorName };
  }

  if (location === 'comment' && isT1(targetId)) {
    const comment = await reddit.getCommentById(targetId);
    return { authorId: comment.authorId, authorName: comment.authorName };
  }

  throw new Error(`Unsupported target: ${location} ${targetId}`);
};

menu.post('/view-as-json', async (c) => {
  const request = await c.req.json<MenuItemRequest>();

  try {
    const data = await loadObject(request);
    return c.json<UiResponse>(await jsonDialog(request.location, data), 200);
  } catch (error) {
    console.error('View as JSON failed', request, error);
    return c.json<UiResponse>(toast(`${TITLES[request.location]} failed`), 200);
  }
});

menu.post('/view-user-as-json', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  let authorName = '';

  try {
    const author = await loadAuthorRef(request);
    authorName = author.authorName;

    const user = await getUser(author.authorId, author.authorName);
    if (!user) {
      return c.json<UiResponse>(
        toast(`User "${authorName}" is not available`),
        200
      );
    }

    return c.json<UiResponse>(await jsonDialog('user', user.toJSON()), 200);
  } catch (error) {
    console.error('View User as JSON failed', request, error);
    return c.json<UiResponse>(
      toast(
        authorName
          ? `Could not load user "${authorName}"`
          : `${TITLES.user} failed`
      ),
      200
    );
  }
});
