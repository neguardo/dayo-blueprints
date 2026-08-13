interface ErrorLike {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error !== null) {
    const candidate = error as ErrorLike;
    if (candidate.code === 'PGRST205') {
      return 'The DAYO database is not installed yet. Run supabase/schema.sql in this Supabase project.';
    }
    const parts = [candidate.message, candidate.details, candidate.hint]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0);

    if (parts.length > 0) return [...new Set(parts)].join(' ');
    if (typeof candidate.code === 'string') return `${fallback} (${candidate.code})`;
  }

  return fallback;
}
