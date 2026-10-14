import os, re, json, time, uuid, hmac, hashlib, secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
import dns.resolver
import certifi
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
import jwt
from dotenv import load_dotenv
from fastapi import Body, Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

load_dotenv()
SECRET = os.getenv("JWT_SECRET", "change-me")
MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "micropil_db")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL is missing. Add it to your .env file.")

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=20000, tlsCAFile=certifi.where())
db = client[DB_NAME]
NO = {"_id": 0}  # hide Mongo's internal _id, so the frontend gets the same JSON as before

LEGACY = Path("data.json")  # old JSON database, imported into MongoDB once (if present)
UPLOADS = Path("uploads"); UPLOADS.mkdir(exist_ok=True)
STATUS = ("pending", "confirmed", "completed", "cancelled")

uid = lambda: uuid.uuid4().hex[:10]
today = lambda: datetime.now().strftime("%Y-%m-%d")
clean_ph = lambda s: "".join(c for c in str(s or "") if c.isdigit())[-10:]
now_ms = lambda: int(time.time() * 1000)

def hash_pw(p, salt=None):
    salt = salt or secrets.token_hex(8)
    return salt + ":" + hashlib.scrypt(p.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=32).hex()
def check_pw(p, h): return hmac.compare_digest(hash_pw(p, h.split(":")[0]), h)

def seed_procedures():
    P = lambda n, c, t, d: {"id": uid(), "name": n, "category": c, "tag": t, "description": d, "image": ""}
    return [
        P("Sapphire FUE Hair Transplant", "Hair", "Surgical FUE", "Precision follicle extraction using ultra-fine sapphire blades for natural angles and faster healing."),
        P("Beard & Facial Hair Restoration", "Hair", "Facial Hair", "Custom facial mapping to restore density in patchy beards, mustaches or sideburns with permanent donor grafts."),
        P("PRP Therapy", "Hair", "Non-Surgical", "Concentrated platelet-rich plasma injections that strengthen existing hair and support post-transplant recovery."),
        P("Eyebrow Restoration", "Hair", "Surgical FUE", "Fine, directional grafts that rebuild thin or missing eyebrows naturally."),
        P("HydraFacial", "Skin", "Skin Care", "Deep cleansing, exfoliation and hydration for instantly fresher skin."),
        P("Acne Clearance & Rejuvenation", "Skin", "Skin Care", "Targeted programs to clear acne and rejuvenate the skin."),
        P("Laser Hair Removal", "Body", "Laser", "Long-lasting hair reduction with comfortable, clinic-grade laser."),
        P("Body Contouring & Skin Tightening", "Body", "Body", "Non-invasive contouring and tightening solutions for a firmer shape.")]

def seed_results():
    return [{"id": uid(), "title": "Sapphire FUE - Hairline", "before": "", "after": "", "note": "4,000 grafts, 10 months"},
            {"id": uid(), "title": "Beard Restoration", "before": "", "after": "", "note": "2,500 grafts, 8 months"},
            {"id": uid(), "title": "Crown Density", "before": "", "after": "", "note": "FUE + PRP, 9 months"}]

async def init_db():
    try:
        await client.admin.command("ping")
    except Exception as e:
        raise RuntimeError("Cannot connect to MongoDB. Check MONGO_URL and password, and in Atlas open Network Access and add your IP "
                           "(or 0.0.0.0/0 for testing). Details: " + str(e)[:200])
    # one-time import of the old data.json (only when the database is still empty)
    if await db.users.count_documents({}) == 0 and LEGACY.exists():
        d = json.loads(LEGACY.read_text("utf-8"))
        for k in ("users", "appointments", "patients", "procedures", "results"):
            if d.get(k): await db[k].insert_many(d[k])
        await db.settings.replace_one({"_id": "site"}, {"_id": "site", **d.get("settings", {"heroImage": ""})}, upsert=True)
        await db.counters.replace_one({"_id": "patient"}, {"_id": "patient", "n": d.get("counter", 0)}, upsert=True)
        await db.counters.replace_one({"_id": "seeded"}, {"_id": "seeded"}, upsert=True)
    if not await db.counters.find_one({"_id": "seeded"}):  # default content, inserted only once
        if await db.procedures.count_documents({}) == 0: await db.procedures.insert_many(seed_procedures())
        if await db.results.count_documents({}) == 0: await db.results.insert_many(seed_results())
        await db.counters.insert_one({"_id": "seeded"})
    if not await db.settings.find_one({"_id": "site"}):
        await db.settings.insert_one({"_id": "site", "heroImage": ""})
    if await db.users.count_documents({}) == 0:
        await db.users.insert_one({"id": uid(), "name": "Owner", "username": os.getenv("ADMIN_USER", "admin"),
            "pass": hash_pw(os.getenv("ADMIN_PASS", "micropil123")), "role": "admin", "active": True})
    await db.users.create_index("username", unique=True)
    await db.patients.create_index("code", unique=True)

@asynccontextmanager
async def lifespan(_):
    await init_db()
    yield

app = FastAPI(title="Micropil API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(HTTPException)
async def _http(_, e): return JSONResponse({"error": e.detail}, status_code=e.status_code)
@app.exception_handler(RequestValidationError)
async def _val(_, e): return JSONResponse({"error": "Invalid data sent."}, status_code=400)

bearer = HTTPBearer(auto_error=False)
def auth(*roles):
    def dep(c: HTTPAuthorizationCredentials = Depends(bearer)):
        try: u = jwt.decode(c.credentials, SECRET, algorithms=["HS256"])
        except Exception: raise HTTPException(401, "Please sign in again.")
        if roles and u.get("role") not in roles: raise HTTPException(403, "Your role cannot do this.")
        return u
    return dep
ADMIN, ANY = auth("admin"), auth()

# ---------------- public ----------------
@app.get("/")
async def root():
    await client.admin.command("ping")
    return {"message": "Micropil API is running and MongoDB is connected.", "database": DB_NAME}

@app.get("/api/settings")
async def settings(): return await db.settings.find_one({"_id": "site"}, NO) or {}

@app.get("/api/procedures")
async def procedures(): return await db.procedures.find({}, NO).to_list(None)

@app.get("/api/results")
async def results(): return await db.results.find({}, NO).to_list(None)

@app.get("/api/slots")
async def slots(date: str = ""):
    return [a["time"] async for a in db.appointments.find({"date": date, "status": {"$ne": "cancelled"}}, NO)]

@app.post("/api/appointments")
async def book(b: dict = Body(...)):
    name, phone, procedure, date, time_ = (str(b.get(k) or "").strip() for k in ("name", "phone", "procedure", "date", "time"))
    if not name or len(clean_ph(phone)) < 10 or len(phone) > 15 or not procedure or not date or not time_:
        raise HTTPException(400, "Please fill all required fields correctly.")
    if date < today(): raise HTTPException(400, "Date cannot be in the past.")
    if await db.appointments.find_one({"date": date, "time": time_, "status": {"$ne": "cancelled"}}):
        raise HTTPException(409, "This time slot is already booked. Please choose another.")
    await db.appointments.insert_one({"id": uid(), "name": name[:80], "phone": phone, "email": str(b.get("email") or "")[:80],
        "procedure": procedure, "date": date, "time": time_, "message": str(b.get("message") or "")[:500],
        "status": "pending", "createdAt": now_ms()})
    return {"ok": 1}

tries: dict = {}
@app.post("/api/portal")  # patient portal: ID + mobile number
async def portal(request: Request, b: dict = Body(...)):
    ip = request.client.host if request.client else "x"
    t = tries[ip] = [x for x in tries.get(ip, []) if time.time() - x < 900]
    if len(t) >= 10: raise HTTPException(429, "Too many attempts. Please try again in 15 minutes.")
    t.append(time.time())
    code = re.escape(str(b.get("code") or "").strip())
    p = await db.patients.find_one({"code": {"$regex": f"^{code}$", "$options": "i"}}, NO)
    if not p or clean_ph(p["phone"]) != clean_ph(b.get("phone")):
        raise HTTPException(404, "No record found. Check your patient ID and mobile number.")
    return {"code": p["code"], "name": p["name"], "treatments": p["treatments"]}

# ---------------- login & team ----------------
@app.post("/api/admin/login")
async def login(b: dict = Body(...)):
    u = await db.users.find_one({"username": b.get("username"), "active": {"$ne": False}}, NO)
    if not u or not check_pw(str(b.get("password") or ""), u["pass"]): raise HTTPException(401, "Wrong username or password.")
    token = jwt.encode({"id": u["id"], "name": u["name"], "role": u["role"], "exp": datetime.now(timezone.utc) + timedelta(hours=12)}, SECRET, algorithm="HS256")
    return {"token": token, "user": {"name": u["name"], "role": u["role"]}}

@app.get("/api/admin/users")
async def users(u=Depends(ADMIN)): return await db.users.find({}, {"_id": 0, "pass": 0}).to_list(None)

@app.post("/api/admin/users")
async def add_user(b: dict = Body(...), u=Depends(ADMIN)):
    name, username, pw = b.get("name"), b.get("username"), str(b.get("password") or "")
    if not name or not username or len(pw) < 6: raise HTTPException(400, "Name, username and a password of 6+ characters are required.")
    if await db.users.find_one({"username": username}): raise HTTPException(409, "This username is already taken.")
    await db.users.insert_one({"id": uid(), "name": name, "username": username, "pass": hash_pw(pw),
                               "role": "admin" if b.get("role") == "admin" else "staff", "active": True})
    return {"ok": 1}

@app.put("/api/admin/users/{uid_}")
async def edit_user(uid_: str, b: dict = Body(...), u=Depends(ADMIN)):
    if uid_ == u["id"] and (b.get("active") is False or b.get("role") == "staff"):
        raise HTTPException(400, "You cannot disable or demote yourself.")
    s = {}
    if b.get("name"): s["name"] = b["name"]
    if b.get("role") in ("admin", "staff"): s["role"] = b["role"]
    if "active" in b: s["active"] = bool(b["active"])
    if len(str(b.get("password") or "")) >= 6: s["pass"] = hash_pw(b["password"])
    if s: await db.users.update_one({"id": uid_}, {"$set": s})
    return {"ok": 1}

@app.delete("/api/admin/users/{uid_}")
async def del_user(uid_: str, u=Depends(ADMIN)):
    if uid_ == u["id"]: raise HTTPException(400, "You cannot delete yourself.")
    await db.users.delete_one({"id": uid_})
    return {"ok": 1}

# ---------------- appointments ----------------
@app.get("/api/admin/appointments")
async def appointments(u=Depends(ANY)): return await db.appointments.find({}, NO).sort("createdAt", -1).to_list(None)

@app.patch("/api/admin/appointments/{aid}")
async def set_status(aid: str, b: dict = Body(...), u=Depends(ANY)):
    if b.get("status") not in STATUS: raise HTTPException(400, "Invalid status.")
    await db.appointments.update_one({"id": aid}, {"$set": {"status": b["status"]}})
    return {"ok": 1}

@app.delete("/api/admin/appointments/{aid}")
async def del_appt(aid: str, u=Depends(ADMIN)):
    await db.appointments.delete_one({"id": aid})
    return {"ok": 1}

@app.get("/api/admin/report")
async def report(range: str = "all", u=Depends(ANY)):
    days = {"day": 1, "week": 7, "month": 30}.get(range)
    start = now_ms() - days * 86_400_000 if days else 0
    lst = await db.appointments.find({"createdAt": {"$gte": start}}, NO).sort("createdAt", -1).to_list(None)
    count = lambda f: {k: sum(1 for a in lst if f(a) == k) for k in {f(a) for a in lst}}
    return {"total": len(lst), "byStatus": count(lambda a: a["status"]), "byProcedure": count(lambda a: a["procedure"]), "list": lst}

# ---------------- patients ----------------
@app.get("/api/admin/patients")
async def patients(u=Depends(ANY)): return await db.patients.find({}, NO).sort("createdAt", -1).to_list(None)

async def phone_taken(phone, except_id=None):
    async for x in db.patients.find({}, {"_id": 0, "id": 1, "phone": 1}):
        if x["id"] != except_id and clean_ph(x["phone"]) == clean_ph(phone): return x["id"]

@app.post("/api/admin/patients")
async def new_patient(b: dict = Body(...), u=Depends(ANY)):
    if not b.get("name") or len(clean_ph(b.get("phone"))) < 10: raise HTTPException(400, "Name and a valid mobile number are required.")
    t = [{"id": uid(), "procedure": b["procedure"], "date": b.get("date") or today(), "total": float(b.get("total") or 0),
          "status": "ongoing", "notes": "", "payments": [], "sessions": []}] if b.get("procedure") else []
    pid = await phone_taken(b["phone"])
    if pid:  # same mobile number = same patient, just add the new procedure
        if t: await db.patients.update_one({"id": pid}, {"$push": {"treatments": {"$each": t}}})
        return await db.patients.find_one({"id": pid}, NO)
    c = await db.counters.find_one_and_update({"_id": "patient"}, {"$inc": {"n": 1}}, upsert=True, return_document=ReturnDocument.AFTER)
    p = {"id": uid(), "code": f"MP-{c['n']:04d}", "name": b["name"], "phone": b["phone"], "email": b.get("email") or "", "createdAt": now_ms(), "treatments": t}
    await db.patients.insert_one(dict(p))
    return p

@app.put("/api/admin/patients/{pid}")
async def edit_patient(pid: str, b: dict = Body(...), u=Depends(ANY)):
    if not b.get("name") or len(clean_ph(b.get("phone"))) < 10: raise HTTPException(400, "Name and a valid mobile number are required.")
    if await phone_taken(b["phone"], pid): raise HTTPException(409, "Another patient already uses this mobile number.")
    old = await db.patients.find_one({"id": pid}, NO)
    if not old: raise HTTPException(404, "Patient not found.")
    b.pop("_id", None)
    await db.patients.replace_one({"id": pid}, {**b, "id": pid, "code": old["code"], "createdAt": old["createdAt"]})
    return {"ok": 1}

@app.delete("/api/admin/patients/{pid}")
async def del_patient(pid: str, u=Depends(ADMIN)):
    await db.patients.delete_one({"id": pid})
    return {"ok": 1}

# ---------------- content: uploads, settings, procedures, results ----------------
@app.post("/api/admin/upload")
async def upload(file: UploadFile = File(...), u=Depends(ADMIN)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/avif"):
        raise HTTPException(400, "Choose a JPG, PNG or WebP image (max 20 MB).")
    data = await file.read()
    if len(data) > 20 * 1024 * 1024: raise HTTPException(400, "Image is larger than 20 MB.")
    name = uid() + Path(file.filename or "").suffix.lower()
    (UPLOADS / name).write_bytes(data)  # original quality, no compression
    return {"url": "/uploads/" + name}

@app.put("/api/admin/settings")
async def put_settings(b: dict = Body(...), u=Depends(ADMIN)):
    b.pop("_id", None)
    if b: await db.settings.update_one({"_id": "site"}, {"$set": b}, upsert=True)
    return {"ok": 1}

def crud(kind):
    @app.post(f"/api/admin/{kind}", name=f"add_{kind}")
    async def add(b: dict = Body(...), u=Depends(ADMIN)):
        o = {**b, "id": uid()}; o.pop("_id", None)
        await db[kind].insert_one(dict(o))
        return o
    @app.put(f"/api/admin/{kind}/{{iid}}", name=f"edit_{kind}")
    async def edit(iid: str, b: dict = Body(...), u=Depends(ADMIN)):
        b.pop("_id", None); b.pop("id", None)
        if b: await db[kind].update_one({"id": iid}, {"$set": b})
        return {"ok": 1}
    @app.delete(f"/api/admin/{kind}/{{iid}}", name=f"del_{kind}")
    async def remove(iid: str, u=Depends(ADMIN)):
        await db[kind].delete_one({"id": iid})
        return {"ok": 1}
for k in ("procedures", "results"): crud(k)