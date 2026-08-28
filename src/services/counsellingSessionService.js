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

export async function getCounsellingSessionById(id, { signal } = {}) {
  const response = await fetch(`/api/counselling-sessions?id=${encodeURIComponent(id)}`, { signal });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('The counselling sessions API returned an invalid response');
  }

  if (!response.ok || !result.success) {
    // 中文原文：无法读取个案资料
    const error = new Error(result.message || 'Unable to retrieve case data');
    error.status = response.status;
    throw error;
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('The counselling sessions API returned invalid data');
  }

  return result.data;
}

export async function createCounsellingSession(payload) {
  const response = await fetch('/api/counselling-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('The counselling sessions API returned an invalid response');
  }

  if (!response.ok || !result.success) {
    // 中文原文：无法新增个案
    throw new Error(result.message || 'Unable to create case');
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('The counselling sessions API returned invalid data');
  }

  return result.data;
}

export async function updateCounsellingSession(id, payload) {
  const response = await fetch(`/api/counselling-sessions?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('The counselling sessions API returned an invalid response');
  }

  if (!response.ok || !result.success) {
    // 中文原文：无法更新个案
    const error = new Error(result.message || 'Unable to update case');
    error.status = response.status;
    throw error;
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('The counselling sessions API returned invalid data');
  }

  return result.data;
}

export async function deleteCounsellingSession(id) {
  const response = await fetch(`/api/counselling-sessions?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('The counselling sessions API returned an invalid response');
  }

  if (!response.ok || !result.success) {
    // 中文原文：无法删除个案
    const error = new Error(result.message || 'Unable to delete case');
    error.status = response.status;
    throw error;
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('The counselling sessions API returned invalid data');
  }

  return result.data;
}
