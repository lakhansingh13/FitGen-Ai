const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${path}`;
  
  const headers: Record<string, string> = {};
  
  // Set default Content-Type if there's a body and it is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  return fetch(url, defaultOptions);
}
