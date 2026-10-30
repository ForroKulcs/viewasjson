import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';

export const forms = new Hono();

forms.post('/json-view-submit', (c) => c.json<UiResponse>({}, 200));
