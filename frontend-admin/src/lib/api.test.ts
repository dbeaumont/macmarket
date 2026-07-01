import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, setTokenProvider } from './api';

describe('apiFetch', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setTokenProvider(() => Promise.resolve(undefined));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('resolves with the parsed JSON body on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1', name: 'Mac Mini' }),
    } as unknown as Response);

    const result = await apiFetch<{ readonly id: string; readonly name: string }>('/products/1');

    expect(result).toEqual({ id: '1', name: 'Mac Mini' });
  });

  it('resolves with undefined on a 204 No Content response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error('should not be called')),
    } as unknown as Response);

    await expect(apiFetch('/orders/1')).resolves.toBeUndefined();
  });

  it('injects a Bearer token header when a token provider is configured', async () => {
    setTokenProvider(() => Promise.resolve('my-token'));
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    await apiFetch('/products');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/products',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    );
  });

  it('throws with the server-provided message when the response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Produit introuvable' }),
    } as unknown as Response);

    await expect(apiFetch('/products/unknown')).rejects.toThrow('Produit introuvable');
  });

  it('falls back to a generic error message when the error body has no message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(apiFetch('/products')).rejects.toThrow('API error 500');
  });
});
