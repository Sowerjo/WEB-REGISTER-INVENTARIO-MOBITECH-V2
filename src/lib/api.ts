type Method = 'GET' | 'POST'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  const url = `${BASE_URL.replace(/\/$/,'')}/${path.replace(/^\//,'')}`
  const headers: Record<string,string> = {
    'X-API-Key': API_KEY,
  }
  let init: RequestInit = { method, headers }
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
    init = { ...init, body: JSON.stringify(body || {}) }
  }
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get<T>(path: string) { return request<T>(path, 'GET') },
  post<T>(path: string, body?: unknown) { return request<T>(path, 'POST', body) },
}

