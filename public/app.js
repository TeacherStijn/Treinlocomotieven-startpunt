const gridBody = document.querySelector("#grid tbody");
const statusEl = document.querySelector("#status");
const btnLoad = document.querySelector("#btnLoad");
const readKey = document.querySelector("#readKey");
const adminKey = document.querySelector("#adminKey");
const frm = document.querySelector("#frm");
const idEl = document.querySelector("#id");
const serieEl = document.querySelector("#serie");
const typeEl = document.querySelector("#type");
const fabrikantEl = document.querySelector("#fabrikant");
const bouwjaarEl = document.querySelector("#bouwjaar");
const spoorwijdteEl = document.querySelector("#spoorwijdte");
const tractieEl = document.querySelector("#tractie");
const maxSnelheidEl = document.querySelector("#maxSnelheid");
const btnReset = document.querySelector("#btnReset");
const adminPanel = document.querySelector("#adminPanel");

function authHeader(write) {
  const k = write ? adminKey.value : (readKey.value || adminKey.value);
  return { Authorization: `Bearer ${k}` };
}

function setStatus(t) {
  statusEl.textContent = t;
}

function rowTemplate(x) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${x.id}</td>
    <td>${x.serie}</td>
    <td>${x.type}</td>
    <td>${x.fabrikant || ""}</td>
    <td>${x.bouwjaar || ""}</td>
    <td>${x.spoorwijdte || ""}</td>
    <td>${x.tractie || ""}</td>
    <td>${x.maxSnelheid || ""}</td>
    <td class="actions">
      <button data-id="${x.id}" data-action="edit">Bewerken</button>
      <button data-id="${x.id}" data-action="delete">Verwijderen</button>
    </td>
  `;
  return tr;
}

async function loadData() {
  try {
    setStatus("Laden");
    const res = await fetch("/api/locomotives", { headers: authHeader(false) });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    gridBody.innerHTML = "";
    data.forEach(x => gridBody.appendChild(rowTemplate(x)));
    setStatus(`Gevonden ${data.length} items`);
  } catch (e) {
    setStatus(`Fout: ${e.message}`);
  }
}

function formToBody() {
  return {
    serie: serieEl.value.trim(),
    type: typeEl.value.trim(),
    fabrikant: fabrikantEl.value.trim(),
    bouwjaar: bouwjaarEl.value ? Number(bouwjaarEl.value) : undefined,
    spoorwijdte: spoorwijdteEl.value ? Number(spoorwijdteEl.value) : undefined,
    tractie: tractieEl.value.trim(),
    maxSnelheid: maxSnelheidEl.value ? Number(maxSnelheidEl.value) : undefined
  };
}

function setForm(x) {
  idEl.value = x?.id || "";
  serieEl.value = x?.serie || "";
  typeEl.value = x?.type || "";
  fabrikantEl.value = x?.fabrikant || "";
  bouwjaarEl.value = x?.bouwjaar || "";
  spoorwijdteEl.value = x?.spoorwijdte || "";
  tractieEl.value = x?.tractie || "";
  maxSnelheidEl.value = x?.maxSnelheid || "";
}

gridBody.addEventListener("click", async e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  if (action === "edit") {
    try {
      const res = await fetch(`/api/locomotives/${id}`, { headers: authHeader(false) });
      if (!res.ok) throw new Error(`${res.status}`);
      const item = await res.json();
      setForm(item);
      adminPanel.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setStatus(`Fout: ${err.message}`);
    }
  }
  if (action === "delete") {
    try {
      const res = await fetch(`/api/locomotives/${id}`, { method: "DELETE", headers: { ...authHeader(true) } });
      if (!res.ok) throw new Error(`${res.status}`);
      await loadData();
      setForm(null);
      setStatus("Verwijderd");
    } catch (err) {
      setStatus(`Fout: ${err.message}`);
    }
  }
});

frm.addEventListener("submit", async e => {
  e.preventDefault();
  const body = formToBody();
  const id = idEl.value;
  try {
    const res = await fetch(id ? `/api/locomotives/${id}` : "/api/locomotives", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...authHeader(true) },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${res.status}`);
    await loadData();
    setForm(null);
    setStatus("Opgeslagen");
  } catch (err) {
    setStatus(`Fout: ${err.message}`);
  }
});

btnReset.addEventListener("click", () => {
  setForm(null);
  setStatus("Leeg");
});

btnLoad.addEventListener("click", () => {
  loadData();
});

function toggleAdmin() {
  const enabled = !!adminKey.value;
  adminPanel.style.display = enabled ? "block" : "none";
}
adminKey.addEventListener("input", toggleAdmin);
toggleAdmin();
loadData();
