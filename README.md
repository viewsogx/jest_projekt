# CRUD REST API tesztelése Jesttel

**Kizmus Noel · Brückner Artúr Benedek**

> Unit tesztek egy Express + MongoDB backendhez — mockolással, külső függőségek nélkül.

---

## 1. Mi volt a feladat?

Egy **komplett CRUD REST API backend** kiszolgálóhoz kellett **unit teszteket** írni.

Követelmények:

- Minden végpontra **legalább 6-6 teszt**
- A tesztek **külső függéstől mentesek** (nem kell futó adatbázis!)
- A csapat felosztja egymás között a végpontokat

A tesztelésnél négy kérdésre keressük a választ:

| # | Kérdés |
|---|--------|
| 1 | Létezik-e a függvény? |
| 2 | Meghívtuk-e a függvényt? |
| 3 | Megfelelően hívtuk-e meg? (milyen paraméterekkel) |
| 4 | Megfelelő státuszkódot kapunk-e? |

---

## 2. A technológiai stack

| Réteg | Technológia | Szerep |
|-------|-------------|--------|
| Szerver | **Express 5** | HTTP végpontok |
| Adatbázis | **MongoDB + Mongoose** | Adatmodell, lekérdezések |
| Tesztelés | **Jest 30** | Unit tesztek, mockolás |
| Konfiguráció | **dotenv** | Környezeti változók |
| Fejlesztés | **nodemon** | Automatikus újraindítás |

```json
"scripts": {
  "start": "nodemon ./app.js",
  "test": "jest"
}
```

---

## 3. Projekt felépítése

```
jest_projekt/
├── app.js                      # belépési pont, DB kapcsolat
├── routes/
│   └── routes.js               # URL -> controller bekötés
├── controller/
│   ├── controller.js           # üzleti logika (4 művelet)
│   └── controller.test.js      # ← a unit tesztek
├── model/
│   └── model.js                # Member séma
└── package.json
```

**Rétegek szétválasztása** = a controller tesztelhető izoláltan, az adatbázis nélkül.

---

## 4. Az adatmodell

```js
const memberSchema = new mongoose.Schema({
  name: { required: true, type: String },
  age:  { required: [true, "A kor megadása kötelező!"], type: Number },
});

module.exports = mongoose.model("Member", memberSchema, "members");
```

Egy `Member` (tag) rendelkezik:

- **name** – kötelező szöveg
- **age** – kötelező szám (saját hibaüzenettel)

---

## 5. A CRUD végpontok

| Metódus | Útvonal | Controller | Mit csinál? |
|---------|---------|------------|-------------|
| `POST` | `/api/` | `createMember` | Új tag létrehozása |
| `GET` | `/api/:id` | `getMember` | Egy tag lekérdezése |
| `PATCH` | `/api/:id` | `updateMember` | Egy tag módosítása |
| `DELETE` | `/api/:id` | `deleteMember` | Egy tag törlése |

```js
router.post("/", controller.createMember);
router.get("/:id", controller.getMember);
router.patch("/:id", controller.updateMember);
router.delete("/:id", controller.deleteMember);
```

---

## 6. Hogyan néz ki egy controller?

```js
module.exports.getMember = async (req, res) => {
  try {
    const member = await Model.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    return res.status(200).json(member);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

**Minta, ami minden végpontban közös:**

1. Meghívja a modellt a megfelelő paraméterrel
2. Kezeli a „nem található” esetet → **404**
3. Kezeli a hibát → **500**
4. Siker esetén a megfelelő státuszkód + JSON

---

## 7. Mi az a mockolás?

A teszteléshez **nem indítunk MongoDB-t**. Helyette a modellt „kicseréljük” egy hamis objektumra.

```js
jest.mock("../model/model", () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
```

Miért jó ez?

- ✅ Gyors (nincs hálózat, nincs adatbázis)
- ✅ Determinisztikus (mindig ugyanaz az eredmény)
- ✅ Bármilyen hibát elő tudunk idézni (`mockRejectedValue`)
- ✅ Tisztán a controller logikáját teszteljük

---

## 8. A `res` objektum utánozása

A controller `res.status(...).json(...)` láncot használ — ezt is le kell mockolni:

```js
const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res); // láncolhatóság miatt visszaadja önmagát
  res.json = jest.fn(() => res);
  return res;
};
```

Így később ellenőrizhetjük:

```js
expect(res.status).toHaveBeenCalledWith(201);
expect(res.json).toHaveBeenCalledWith(body);
```

---

## 9. A négy alapkérdés a gyakorlatban

**① Létezik a függvény?**
```js
test("létezik", () =>
  expect(controller.createMember).toEqual(expect.any(Function))
);
```

**② Meghívtuk a függvényt (a modellt)?**
```js
expect(Model.create).toHaveBeenCalled();
```

**③ Megfelelően hívtuk meg?**
```js
expect(Model.create).toHaveBeenCalledWith(body);
```

**④ Megfelelő státuszkódot kapunk?**
```js
expect(res.status).toHaveBeenCalledWith(201);
```

---

## 10. Tesztek végpontonként (24 teszt)

Minden végpontnál **6 teszt**, ugyanazzal a logikával:

| Ellenőrzés | POST | GET | PATCH | DELETE |
|-----------|:----:|:---:|:-----:|:------:|
| Függvény létezik | ✅ | ✅ | ✅ | ✅ |
| Modell meghívva | ✅ | ✅ | ✅ | ✅ |
| Helyes paraméterek | ✅ | ✅ | ✅ | ✅ |
| Sikeres státuszkód | 201 | 200 | 200 | 200 |
| Nem található → 404 | – | ✅ | ✅ | ✅ |
| Hiba → 500 | ✅ | ✅ | ✅ | ✅ |

> A POST-nál nincs 404, mert ott nem keresünk meg létező rekordot — helyette a body átadását és a hibaüzenetet teszteljük.

---

## 11. Példa: POST végpont tesztjei

```js
describe("createMember (POST)", () => {
  const body = { name: "Cartman", age: 10 };

  test("siker esetén 201-et és a tagot adja", async () => {
    Model.create.mockResolvedValue(body);
    const res = makeRes();
    await controller.createMember({ body }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(body);
  });

  test("modellhiba esetén 500-at ad", async () => {
    Model.create.mockRejectedValue(new Error("hiba"));
    const res = makeRes();
    await controller.createMember({ body }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "hiba" });
  });
});
```

---

## 12. Példa: PATCH — az opciók is számítanak

Az `updateMember` nem csak az id-t és a body-t adja át, hanem beállításokat is:

```js
expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
  "123",
  { age: 11 },
  { new: true, runValidators: true }
);
```

- `new: true` → a **frissített** dokumentumot kapjuk vissza
- `runValidators: true` → a séma validációja **módosításkor is** lefut

---

## 13. Hogyan futtatjuk?

```bash
npm install     # függőségek telepítése
npm test        # Jest tesztek futtatása
```

Várható eredmény:

```
PASS  controller/controller.test.js
  createMember (POST)   ✓✓✓✓✓✓
  getMember (GET)       ✓✓✓✓✓✓
  updateMember (PATCH)  ✓✓✓✓✓✓
  deleteMember (DELETE) ✓✓✓✓✓✓

Tests: 24 passed, 24 total
```

> Az `npm start` a szervert indítja a `http://localhost:3000` címen.

---

## 14. Mit tanultunk?

- **Unit teszt** = egyetlen egység (függvény) izolált vizsgálata
- **Mockolás** = külső függőségek helyettesítése → gyors, független tesztek
- **AAA minta**: Arrange (előkészítés) → Act (meghívás) → Assert (ellenőrzés)
- A **státuszkódok** (200, 201, 404, 500) helyes használata REST API-ban
- A teszt **dokumentálja** is a kódot: megmutatja, mire számíthatunk
- A jó teszt **hibát is elkap**, nem csak „zöld pipát” ad

---

## 15. Lehetséges továbbfejlesztések

- `GET /api/` — összes tag listázása
- Integrációs tesztek (`supertest` + in-memory MongoDB)
- Bemenet-validáció és egyedi hibaüzenetek
- Tesztlefedettség mérése (`jest --coverage`)
- CI pipeline (GitHub Actions): minden push-nál automatikus tesztfuttatás

---

## 16. Összefoglalás

> **Cél:** egy CRUD REST API megbízható működésének bizonyítása — adatbázis nélkül.

- 🧩 4 végpont × 6 teszt = **24 unit teszt**
- 🎭 **Mockolt** Mongoose modell → külső függéstől mentes
- ✅ Minden eset lefedve: siker, nem található, hiba
- 🚀 Egy paranccsal futtatható: `npm test`

**Köszönjük a figyelmet!**
