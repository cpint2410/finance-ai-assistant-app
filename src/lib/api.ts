const API_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (endpoint: string) =>
  `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

export const apiFetch = (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  return fetch(apiUrl(endpoint), options);
};