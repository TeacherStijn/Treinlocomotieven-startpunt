import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Alias types voor Express die door JSDoc worden begrepen.
 * Voor echte typecontrole kun je TypeScript of @ts-check gebruiken.
 *
 * @typedef {*} ExpressRequest
 * @typedef {*} ExpressResponse
 * @typedef {Function} NextFunction
 */

/**
 * Absolute pad naar dit bestand.
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);
/**
 * Absolute map van dit bestand.
 * @type {string}
 */
const __dirname = path.dirname(__filename);

/**
 * Gegevensobject voor het aanmaken van een Locomotief.
 * @typedef {Object} LocomotiefInit
 * @property {number|string} id Unieke identificatie. Wordt naar number geconverteerd.
 * @property {string} serie Naam of serie van de locomotief.
 * @property {string} type Type aandrijving of inzet. Bijvoorbeeld Elektrisch of Diesel.
 * @property {string} [fabrikant] Naam van de fabrikant.
 * @property {number|string} [bouwjaar] Bouwjaar.
 * @property {number|string} [spoorwijdte] Spoorwijdte in millimeters. Standaard 1435.
 * @property {string} [tractie] Verkorte aanduiding van tractie. Bijvoorbeeld E of D.
 * @property {number|string} [maxSnelheid] Maximumsnelheid in kilometer per uur.
 */

/**
 * Patchobject voor het bijwerken van een Locomotief.
 * Alle velden zijn optioneel.
 * @typedef {Object} LocomotiefPatch
 * @property {string} [serie]
 * @property {string} [type]
 * @property {string} [fabrikant]
 * @property {number|string} [bouwjaar]
 * @property {number|string} [spoorwijdte]
 * @property {string} [tractie]
 * @property {number|string} [maxSnelheid]
 */

/**
 * JSON representatie van een Locomotief.
 * @typedef {Object} LocomotiefJSON
 * @property {number} id
 * @property {string} serie
 * @property {string} type
 * @property {string} fabrikant
 * @property {number} bouwjaar
 * @property {number} spoorwijdte
 * @property {string} tractie
 * @property {number} maxSnelheid
 */

/**
 * Model van een locomotief met eenvoudige typeconversies.
 * @class
 */
class Locomotief {
  /**
   * Maakt een nieuwe Locomotief.
   * Converteert bekende velden naar het juiste type.
   * @param {LocomotiefInit} param0 Invoer voor de locomotief.
   */
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

  /**
   * Past een deelwijziging toe op dit object.
   * Afwezige velden worden overgeslagen.
   * @param {LocomotiefPatch} patch Te wijzigen velden.
   * @returns {Locomotief} De huidige instantie voor chaining.
   */
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

  /**
   * Geeft een JSON vriendelijke representatie.
   * @returns {LocomotiefJSON} JSON representatie.
   */
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

/**
 * Eenvoudige in memory repository voor Locomotief objecten.
 * @class
 */
class LocRepository {
  /**
   * Maakt een nieuwe repository.
   * @param {Array<LocomotiefInit>} [seed] Initiële data voor vulling.
   */
  constructor(seed = []) {
    /** @type {Array<Locomotief>} */
    this.items = seed.map(x => new Locomotief(x));
  }

  /**
   * Haalt alle items op als JSON.
   * @returns {Array<LocomotiefJSON>} Lijst met locomotieven.
   */
  all() {
    return this.items.map(x => x.toJSON());
  }

  /**
   * Haalt één item op aan de hand van id.
   * @param {number|string} id Gevraagd id.
   * @returns {LocomotiefJSON|null} Gevonden item of null wanneer afwezig.
   */
  get(id) {
    const item = this.items.find(x => x.id === Number(id));
    return item ? item.toJSON() : null;
  }

  /**
   * Voegt een nieuw item toe.
   * Maakt automatisch een volgend id aan.
   * @param {Omit<LocomotiefInit,"id">} data Gegevens voor de nieuwe locomotief.
   * @returns {LocomotiefJSON} Aangemaakt item.
   */
  add(data) {
    const id = this.items.length ? Math.max(...this.items.map(x => x.id)) + 1 : 1;
    const item = new Locomotief({ id, ...data });
    this.items.push(item);
    return item.toJSON();
  }

  /**
   * Werkt een bestaand item bij aan de hand van id.
   * @param {number|string} id Doel id.
   * @param {LocomotiefPatch} data Patch met te wijzigen velden.
   * @returns {LocomotiefJSON|null} Bijgewerkt item of null wanneer niet gevonden.
   */
  update(id, data) {
    const idx = this.items.findIndex(x => x.id === Number(id));
    if (idx === -1) return null;
    this.items[idx].update(data);
    return this.items[idx].toJSON();
  }

  /**
   * Verwijdert een item op id.
   * @param {number|string} id Te verwijderen id.
   * @returns {LocomotiefJSON|null} Verwijderd item of null wanneer niet gevonden.
   */
  remove(id) {
    const idx = this.items.findIndex(x => x.id === Number(id));
    if (idx === -1) return null;
    const [removed] = this.items.splice(idx, 1);
    return removed.toJSON();
  }
}

/**
 * Eenvoudige API sleutel controle.
 * Ondersteunt lezen via een api key en schrijven via een admin key.
 * @class
 */
class Auth {
  /**
   * @param {string} apiKey Leessleutel.
   * @param {string} adminKey Beheersleutel.
   */
  constructor(apiKey, adminKey) {
    /** @type {string} */
    this.apiKey = apiKey;
    /** @type {string} */
    this.adminKey = adminKey;
  }

  /**
   * Leest een bearer token uit de Authorization header.
   * Wanneer de header alleen een ruwe sleutel bevat wordt deze teruggegeven.
   * @param {ExpressRequest} req Express request.
   * @returns {string} Gevonden token of lege string.
   */
  token(req) {
    const h = req.get("Authorization") || "";
    const parts = h.split(" ");
    return parts.length === 2 ? parts[1] : h;
  }

  /**
   * Middleware die toegang geeft met api key of admin key.
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   * @param {NextFunction} next
   * @returns {void}
   */
  any(req, res, next) {
    const t = this.token(req);
    if (t === this.apiKey || t === this.adminKey) return next();
    res.status(401).json({ error: "Unauthorized" });
  }

  /**
   * Middleware die alleen toegang geeft met admin key.
   * @param {ExpressRequest} req
   * @param {ExpressResponse} res
   * @param {NextFunction} next
   * @returns {void}
   */
  admin(req, res, next) {
    const t = this.token(req);
    if (t === this.adminKey) return next();
    res.status(403).json({ error: "Forbidden" });
  }
}

const app = express();

/**
 * Poort waarop de server luistert.
 * @type {number|string}
 */
const PORT = process.env.PORT || 3000;

/**
 * Leessleutel voor de API.
 * @type {string}
 */
const API_KEY = process.env.API_KEY || "demo-read";

/**
 * Beheersleutel voor mutaties.
 * @type {string}
 */
const ADMIN_KEY = process.env.ADMIN_KEY || "demo-admin";

/** @type {Auth} */
const auth = new Auth(API_KEY, ADMIN_KEY);

/** @type {LocRepository} */
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

/**
 * Rootpagina.
 * Levert de index uit de public map.
 * @name GET/
 * @function
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Haalt alle locomotieven op.
 * Vereist api key of admin key in de Authorization header. Bearer of ruwe sleutel.
 * @name GET/api/locomotives
 * @function
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
app.get("/api/locomotives", auth.any.bind(auth), (req, res) => {
  res.json(repo.all());
});

/**
 * Haalt één locomotief op via id.
 * @name GET/api/locomotives/:id
 * @function
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
app.get("/api/locomotives/:id", auth.any.bind(auth), (req, res) => {
  const item = repo.get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

/**
 * Maakt een locomotief aan.
 * Vereist admin key.
 * Vereist minimaal de velden serie en type in de payload.
 * @name POST/api/locomotives
 * @function
 * @param {ExpressRequest} req Body met velden zoals gedefinieerd in LocomotiefInit zonder id.
 * @param {ExpressResponse} res
 */
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

/**
 * Werkt een locomotief bij via id.
 * Vereist admin key.
 * @name PUT/api/locomotives/:id
 * @function
 * @param {ExpressRequest} req Body met LocomotiefPatch velden.
 * @param {ExpressResponse} res
 */
app.put("/api/locomotives/:id", auth.admin.bind(auth), (req, res) => {
  const updated = repo.update(Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

/**
 * Verwijdert een locomotief via id.
 * Vereist admin key.
 * @name DELETE/api/locomotives/:id
 * @function
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
app.delete("/api/locomotives/:id", auth.admin.bind(auth), (req, res) => {
  const removed = repo.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.json(removed);
});

/**
 * Start de server.
 * Logt de URL naar de console.
 * @returns {void}
 * @example
 * // Start met:
 * // API_KEY="demo-read" ADMIN_KEY="demo-admin" node server.js
 */
app.listen(PORT, () => {
  console.log(`Treinlocomotieven API op http://localhost:${PORT}`);
});
