const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (${response.status}).`)
  }

  return data
}

export function calculateExpression(expression) {
  return request('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression })
  })
}

export function fetchHistory() {
  return request('/api/history')
}

export function deleteHistory(id) {
  return request(`/api/history/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
}
