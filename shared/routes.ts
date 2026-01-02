import { z } from 'zod';
import { insertAuditSchema, audits, auditResults } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  audits: {
    create: {
      method: 'POST' as const,
      path: '/api/audits',
      input: insertAuditSchema,
      responses: {
        201: z.custom<typeof audits.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.internal, // Unauthorized
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/audits',
      responses: {
        200: z.array(z.custom<typeof audits.$inferSelect>()),
        401: errorSchemas.internal,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/audits/:id',
      responses: {
        200: z.custom<typeof audits.$inferSelect & { results: typeof auditResults.$inferSelect[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/audits/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreateAuditInput = z.infer<typeof api.audits.create.input>;
