export async function api(path, { token, method = 'GET', data, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    const options = { method, headers, signal };
    if (data !== undefined) options.body = JSON.stringify(data);
    response = await fetch(`/api/${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach the API. Try again.');
  }

  if (response.status === 204) return;
  const result = await response.json().catch(() => null);
  if (!response.ok || result === null) {
    const error = new Error(result?.message || 'The API could not complete the request.');
    error.status = response.status;
    throw error;
  }
  return result;
}
