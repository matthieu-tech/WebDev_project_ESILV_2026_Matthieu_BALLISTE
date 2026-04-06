const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const headers = {}
  if (options.body) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  // 204 No Content : pas de body à parser
  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw { status: response.status, ...data }
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
