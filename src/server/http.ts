import 'server-only';
import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function readJson<T extends object>(request: Request): Promise<Partial<T>> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Partial<T>) : {};
  } catch {
    throw new HttpError(400, 'Invalid request body.');
  }
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function optionalStr(value: unknown): string | undefined {
  const s = str(value);
  return s ? s : undefined;
}

export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof HttpError) return fail(error.status, error.message);
      console.error(error);
      return fail(500, 'Something went wrong. Please try again.');
    }
  };
}
