import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Locomotive {
  constructor({ id, serie, type, fabrikant = "", bouwjaar = 0, spoorwijdte = 1435, tractie = "", maxSnelheid = 0 }) {
    this.id = Number(id);
    this.serie = String(serie);
    this.type = String(type);
    this.fabrikant = String(fabrikant);
    this.bouwjaar = Number(bouwjaar);
    this.spoorwijdte = Number(spoorwijdte);
    this.tractie = String(tractie);
    this.maxSnelheid = Number(maxSnelheid);
  }
  update(patch) {
    if (patch.serie !== undefined) this.serie = String(patch.serie);
    if (patch.type !== undefined) this.type = String(patch.type);
    if (patch.fabrikant !== undefined) this.fabrikant = String(patch.fabrikant);
    if (patch.bouwjaar !== undefined) this.bouwjaar = Number(patch.bouwjaar);
    if (patch.spoorwijdte !== undefined) this.spoorwijdte = Number(patch.spoorwijdte);
    if (patch.tractie !== undefined) this.tractie = String(patch.tractie);
    if (patch.maxSnelheid !== undefined) this.maxSnelheid = Number(patch.maxSnelheid);
    return this;
  }
  toJSON() {
    return {
      id: this.id,
      serie: this.serie,
      type: this.type,
      fabrikant: this.fabrikant,
      bouwjaar: this.bouwjaar,
      spoorwijdte: this.spoorwijdte,
      tractie: this.tractie,
      maxSnelheid: this.maxSnelheid
    };
  }
}

class LocRepository {
  constructor(seed = []) {
    this.items = seed.map(x => new Locomotive(x));
  }
  all() {
    return this.items.map(x => x.toJSON());
  }
  get(id) {
    const item = this.items.find(x => x.id === Number(id));
    return item ? item.toJSON() : null;
  }
  add(data) {
    const id = this.items.length ? Math.max(...this.items.map(x => x.id)) + 1 : 1;
    const item = new Locomotive({ id, ...data });
    this.items.push(item);
    return item.toJSON();
  }
  update(id, data) {
    const idx = this.items.findIndex(x => x.id === Number(id));
    if (idx === -1) return null;
    this.items[idx].update(data);
    return this.items[idx].toJSON();
  }
  remove(id) {
    const idx = this.items.findIndex(x => x.id === Number(id));
    if (idx === -1) return null;
    const [removed] = this.items.splice(idx, 1);
    return removed.toJSON();
  }
}

class Auth {
  constructor(apiKey, adminKey) {
    this.apiKey = apiKey;
    this.adminKey = adminKey;
  }
  token(req) {
    const h = req.get("Authorization") || "";
    const parts = h.split(" ");
    return parts.length === 2 ? parts[1] : h;
  }
  any(req, res, next) {
    const t = this.token(req);
    if (t === this.apiKey || t === this.adminKey) return next();
    res.status(401).json({ error: "Unauthorized" });
  }
  admin(req, res, next) {
    const t = this.token(req);
    if (t === this.adminKey) return next();
    res.status(403).json({ error: "Forbidden" });
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "demo-read";
const ADMIN_KEY = process.env.ADMIN_KEY || "demo-admin";

const auth = new Auth(API_KEY, ADMIN_KEY);

const repo = new LocRepository([
  { id: 1, serie: "NS 1100", type: "Elektrisch", fabrikant: "Alsthom", bouwjaar: 1950, spoorwijdte: 1435, tractie: "E", maxSnelheid: 130 },
  { id: 2, serie: "NS 1200", type: "Elektrisch", fabrikant: "Werkspoor/Heemaf/Baldwin-Westinghouse", bouwjaar: 1951, spoorwijdte: 1435, tractie: "E", maxSnelheid: 150 },
  { id: 3, serie: "NS 1600", type: "Elektrisch", fabrikant: "Alsthom", bouwjaar: 1981, spoorwijdte: 1435, tractie: "E", maxSnelheid: 160 },
  { id: 4, serie: "NS 1700", type: "Elektrisch", fabrikant: "Alsthom", bouwjaar: 1990, spoorwijdte: 1435, tractie: "E", maxSnelheid: 160 },
  { id: 5, serie: "NS 2200", type: "Diesel", fabrikant: "Allan/EMD", bouwjaar: 1955, spoorwijdte: 1435, tractie: "D", maxSnelheid: 100 },
  { id: 6, serie: "NS 2400", type: "Diesel", fabrikant: "Alsthom", bouwjaar: 1954, spoorwijdte: 1435, tractie: "D", maxSnelheid: 90 },
  { id: 7, serie: "NS 6400", type: "Diesel", fabrikant: "MaK", bouwjaar: 1988, spoorwijdte: 1435, tractie: "D", maxSnelheid: 120 }
]);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/locomotives", auth.any.bind(auth), (req, res) => {
  res.json(repo.all());
});

app.get("/api/locomotives/:id", auth.any.bind(auth), (req, res) => {
  const item = repo.get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.post("/api/locomotives", auth.admin.bind(auth), (req, res) => {
  const b = req.body || {};
  if (!b.serie || !b.type) return res.status(400).json({ error: "Bad request" });
  const created = repo.add({
    serie: String(b.serie),
    type: String(b.type),
    fabrikant: b.fabrikant ? String(b.fabrikant) : "",
    bouwjaar: Number(b.bouwjaar || 0),
    spoorwijdte: Number(b.spoorwijdte || 1435),
    tractie: b.tractie ? String(b.tractie) : "",
    maxSnelheid: Number(b.maxSnelheid || 0)
  });
  res.status(201).json(created);
});

app.put("/api/locomotives/:id", auth.admin.bind(auth), (req, res) => {
  const updated = repo.update(Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

app.delete("/api/locomotives/:id", auth.admin.bind(auth), (req, res) => {
  const removed = repo.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Treinlocomotieven API op http://localhost:${PORT}`);
});
