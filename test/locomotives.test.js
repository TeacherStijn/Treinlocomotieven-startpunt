import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const READ_KEY = "test-read";
const ADMIN_KEY = "test-admin";

let proc;

async function waitUntilReady() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/`);
      if (r.ok || r.status === 401 || r.status === 404) return;
    } catch {}
    await delay(200);
  }
  throw new Error("server not ready");
}

before(async () => {
  proc = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, PORT: String(PORT), API_KEY: READ_KEY, ADMIN_KEY },
    stdio: "inherit"
  });
  await delay(150);
  await waitUntilReady();
});

after(async () => {
  if (proc && !proc.killed) {
    proc.kill();
    await delay(200);
  }
});

test("GET /api/locomotives zonder key geeft 401", async () => {
  const res = await fetch(`${BASE}/api/locomotives`);
  assert.equal(res.status, 401);
});

test("GET /api/locomotives met leeskey geeft lijst", async () => {
  const res = await fetch(`${BASE}/api/locomotives`, {
    headers: { Authorization: `Bearer ${READ_KEY}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
  assert.ok(data[0].id);
});

test("CRUD met adminkey", async () => {
  const nieuw = {
    serie: "NS 1300",
    type: "Elektrisch",
    fabrikant: "Alsthom",
    bouwjaar: 1952,
    spoorwijdte: 1435,
    tractie: "E",
    maxSnelheid: 130
  };

  const createRes = await fetch(`${BASE}/api/locomotives`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nieuw)
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.ok(created.id);
  assert.equal(created.serie, "NS 1300");

  const getRes = await fetch(`${BASE}/api/locomotives/${created.id}`, {
    headers: { Authorization: `Bearer ${READ_KEY}` }
  });
  assert.equal(getRes.status, 200);
  const fetched = await getRes.json();
  assert.equal(fetched.serie, "NS 1300");

  const updRes = await fetch(`${BASE}/api/locomotives/${created.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ADMIN_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ maxSnelheid: 140 })
  });
  assert.equal(updRes.status, 200);
  const updated = await updRes.json();
  assert.equal(updated.maxSnelheid, 140);

  const delRes = await fetch(`${BASE}/api/locomotives/${created.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN_KEY}` }
  });
  assert.equal(delRes.status, 200);

  const missRes = await fetch(`${BASE}/api/locomotives/${created.id}`, {
    headers: { Authorization: `Bearer ${READ_KEY}` }
  });
  assert.equal(missRes.status, 404);
});

test("PUT op niet-bestaand id geeft 404", async () => {
  const res = await fetch(`${BASE}/api/locomotives/999999`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ADMIN_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ serie: "X" })
  });
  assert.equal(res.status, 404);
});
