import type { MemChatLog } from "./type.ts";

const memChatLog: MemChatLog = {};

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const room = params.get("room");
  const from = parseInt(params.get("from") || "0");

  if (!room) {
    return new Response("Missing room", { status: 400 });
  }

  const chatLog: {
    time: number;
    name: string;
    message: string;
    id: string;
  }[] = memChatLog[room] || [];

  const filteredChatLog = chatLog.filter((log) => log.time > from);

  return new Response(JSON.stringify({
    msgs: filteredChatLog,
    time: Date.now(),
  }), {
    headers: { "content-type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const room = params.get("room");
  const name = params.get("name");
  const message = await request.text();

  if (!room) {
    return new Response("Missing room", { status: 400 });
  }

  if (!name) {
    return new Response("Missing name", { status: 400 });
  }

  if (!message) {
    return new Response("Missing message", { status: 400 });
  }

  const chatLog: {
    time: number;
    name: string;
    message: string;
    id: string;
  }[] = memChatLog[room] || [];

  chatLog.push({
    time: Date.now(),
    name,
    message,
    id: Math.random().toString(36).substr(2, 9),
  });

  memChatLog[room] = chatLog;

  return new Response("OK");
}
