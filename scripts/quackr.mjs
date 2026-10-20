// Minimal Quackr MCP client (Streamable HTTP, no dependencies; Node 20+).
// Usage:
//   node scripts/quackr.mjs discover            # list tools + schemas, get-balance
//   node scripts/quackr.mjs call <tool> '<json>' # call any tool
// Purchases are blocked unless ALLOW_PURCHASE=true.
// Reads the key from QUACKR_API_KEY; never prints it.

const URL = process.env.QUACKR_MCP_URL || 'https://mcp.quackr.io/';
const KEY = process.env.QUACKR_API_KEY;
if (!KEY) {
  console.error('QUACKR_API_KEY is not set');
  process.exit(2);
}

let sessionId;
let nextId = 1;

async function rpc(method, params, notify = false) {
  const body = { jsonrpc: '2.0', method, ...(params ? { params } : {}) };
  if (!notify) body.id = nextId++;
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify(body),
  });
  sessionId = res.headers.get('mcp-session-id') || sessionId;
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  if (notify || !text) return null;
  // Response is either JSON or an SSE stream containing a "data:" JSON line.
  const json = text.trimStart().startsWith('{')
    ? text
    : text.split('\n').filter((l) => l.startsWith('data:')).pop()?.slice(5);
  const msg = JSON.parse(json);
  if (msg.error) throw new Error(`${msg.error.code}: ${msg.error.message}`);
  return msg.result;
}

async function connect() {
  await rpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'mpt-stage1', version: '0.1.0' },
  });
  await rpc('notifications/initialized', undefined, true);
}

const show = (v) => console.log(JSON.stringify(v, null, 2));

const [cmd, tool, argsJson] = process.argv.slice(2);
await connect();

if (cmd === 'discover') {
  const { tools } = await rpc('tools/list');
  show(tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })));
  show(await rpc('tools/call', { name: 'get-balance', arguments: {} }));
} else if (cmd === 'call' && tool) {
  if (/purchase/i.test(tool) && process.env.ALLOW_PURCHASE !== 'true') {
    console.error('Refusing to call a purchase tool without ALLOW_PURCHASE=true');
    process.exit(3);
  }
  show(await rpc('tools/call', { name: tool, arguments: argsJson ? JSON.parse(argsJson) : {} }));
} else {
  console.error('usage: quackr.mjs discover | call <tool> [json]');
  process.exit(1);
}
