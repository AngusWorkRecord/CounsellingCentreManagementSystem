import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertAiAvailable,
  requestStructuredAnalysis,
} from './ai.mjs';

const ENV_NAMES = [
  'AI_FEATURE_ENABLED',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'AI_REQUEST_TIMEOUT_MS',
  'VERCEL_ENV',
  'NODE_ENV',
];

function preserveEnvironment() {
  const original = Object.fromEntries(ENV_NAMES.map((name) => [name, process.env[name]]));
  return () => {
    ENV_NAMES.forEach((name) => {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    });
  };
}

function enableTestAi() {
  process.env.AI_FEATURE_ENABLED = 'true';
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_MODEL = 'test-model';
  process.env.VERCEL_ENV = 'preview';
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sourceRefs'],
        properties: { sourceRefs: { type: 'array', items: { type: 'string' } } },
      },
    },
  },
};

function openAiResponse(result, status = 200) {
  return new Response(JSON.stringify({
    status: 'completed',
    output: [{ content: [{ type: 'output_text', text: JSON.stringify(result) }] }],
  }), { status, headers: { 'Content-Type': 'application/json' } });
}

test('production is allowed when the feature and model configuration are enabled', () => {
  const restore = preserveEnvironment();
  try {
    enableTestAi();
    process.env.VERCEL_ENV = 'production';
    assert.doesNotThrow(assertAiAvailable);
  } finally {
    restore();
  }
});

test('feature flag disabled blocks AI', () => {
  const restore = preserveEnvironment();
  try {
    enableTestAi();
    process.env.AI_FEATURE_ENABLED = 'false';
    assert.throws(assertAiAvailable, (error) => error.code === 'AI_NOT_AVAILABLE' && error.status === 503);
  } finally {
    restore();
  }
});

test('missing key or model blocks AI in every environment', () => {
  const restore = preserveEnvironment();
  try {
    enableTestAi();
    process.env.VERCEL_ENV = 'production';
    delete process.env.OPENAI_API_KEY;
    assert.throws(assertAiAvailable, (error) => error.code === 'AI_NOT_CONFIGURED' && error.status === 503);
    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.OPENAI_MODEL;
    assert.throws(assertAiAvailable, (error) => error.code === 'AI_NOT_CONFIGURED' && error.status === 503);
  } finally {
    restore();
  }
});

test('Responses request disables storage and uses strict JSON Schema', async () => {
  const restore = preserveEnvironment();
  const originalFetch = globalThis.fetch;
  let requestBody;
  try {
    enableTestAi();
    globalThis.fetch = async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return openAiResponse({ items: [{ sourceRefs: ['metric:count'] }] });
    };

    const result = await requestStructuredAnalysis({
      instructions: 'test', input: { count: 1 }, schema,
      schemaName: 'test_schema', sourceRefs: ['metric:count'],
    });

    assert.deepEqual(result.items[0].sourceRefs, ['metric:count']);
    assert.equal(requestBody.store, false);
    assert.equal(requestBody.text.format.type, 'json_schema');
    assert.equal(requestBody.text.format.strict, true);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('unknown source references are rejected', async () => {
  const restore = preserveEnvironment();
  const originalFetch = globalThis.fetch;
  try {
    enableTestAi();
    globalThis.fetch = async () => openAiResponse({ items: [{ sourceRefs: ['client:other'] }] });
    await assert.rejects(
      requestStructuredAnalysis({
        instructions: 'test', input: {}, schema,
        schemaName: 'test_schema', sourceRefs: ['metric:count'],
      }),
      (error) => error.code === 'AI_INVALID_OUTPUT'
    );
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('schema-invalid and malformed JSON outputs are rejected', async () => {
  const restore = preserveEnvironment();
  const originalFetch = globalThis.fetch;
  try {
    enableTestAi();
    globalThis.fetch = async () => openAiResponse({ unexpected: true });
    await assert.rejects(
      requestStructuredAnalysis({ instructions: 'test', input: {}, schema, schemaName: 'test_schema', sourceRefs: [] }),
      (error) => error.code === 'AI_INVALID_OUTPUT'
    );
    globalThis.fetch = async () => new Response(JSON.stringify({
      status: 'completed', output: [{ content: [{ type: 'output_text', text: '{not-json' }] }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(
      requestStructuredAnalysis({ instructions: 'test', input: {}, schema, schemaName: 'test_schema', sourceRefs: [] }),
      (error) => error.code === 'AI_INVALID_OUTPUT'
    );
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('refusal and timeout receive safe error codes', async () => {
  const restore = preserveEnvironment();
  const originalFetch = globalThis.fetch;
  try {
    enableTestAi();
    globalThis.fetch = async () => new Response(JSON.stringify({
      status: 'completed', output: [{ content: [{ type: 'refusal', refusal: 'cannot comply' }] }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(
      requestStructuredAnalysis({ instructions: 'test', input: {}, schema, schemaName: 'test_schema', sourceRefs: [] }),
      (error) => error.code === 'AI_REFUSED'
    );
    globalThis.fetch = async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    };
    await assert.rejects(
      requestStructuredAnalysis({ instructions: 'test', input: {}, schema, schemaName: 'test_schema', sourceRefs: [] }),
      (error) => error.code === 'AI_TIMEOUT'
    );
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test('a retryable upstream failure is retried only once', async () => {
  const restore = preserveEnvironment();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    enableTestAi();
    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) return new Response('{}', { status: 500 });
      return openAiResponse({ items: [{ sourceRefs: ['metric:count'] }] });
    };
    await requestStructuredAnalysis({
      instructions: 'test', input: {}, schema,
      schemaName: 'test_schema', sourceRefs: ['metric:count'],
    });
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});
