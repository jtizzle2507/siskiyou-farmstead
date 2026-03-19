export async function adminApi(action: string, data: Record<string, unknown>) {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Admin API request failed');
  }
  return result;
}
