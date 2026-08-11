export async function getCounsellingSessions({ signal } = {}) {
  const response = await fetch('/api/counselling-sessions', { signal });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('The counselling sessions API returned an invalid response');
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to retrieve counselling sessions');
  }

  if (!Array.isArray(result.data)) {
    throw new Error('The counselling sessions API returned invalid data');
  }

  return result.data;
}
