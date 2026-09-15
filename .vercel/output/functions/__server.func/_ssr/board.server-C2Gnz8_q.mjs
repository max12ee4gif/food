import { a as computePhase, c as nextServiceDate, d as weekdayLabel, i as addDaysYmd, l as readClock, n as PRICE_CENTS, o as dateLabel, r as TIMEZONE, s as isWeekend, t as DISH_PRESETS, u as timeLabelFromIso } from "./time-D7K8VdEQ.mjs";
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/board.server-C2Gnz8_q.js
var _0002_schema_default = "-- Hoy Hay: daily high-school lunch plates (unowned rows; admin gated in app code)\n\ncreate table if not exists settings (\n  id integer primary key check (id = 1),\n  max_per_person integer not null default 3,\n  capacity integer not null default 10,\n  price_cents integer not null default 1000,\n  timezone text not null default 'America/Chicago',\n  cutoff_hour integer not null default 8,\n  leftover_end_hour integer not null default 15,\n  admin_username text not null default 'admin',\n  admin_password_hash text not null,\n  vendor_phone text,\n  sms_enabled boolean not null default false,\n  phase_override text,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists service_days (\n  id serial primary key,\n  service_date date not null unique,\n  dish_name text not null,\n  photo_url text,\n  notes text,\n  capacity integer not null default 10,\n  price_cents integer not null default 1000,\n  status text not null default 'open',\n  cancel_message text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists service_days_date_idx on service_days (service_date desc);\n\ncreate table if not exists reservations (\n  id serial primary key,\n  service_day_id integer not null references service_days(id) on delete cascade,\n  name text not null,\n  phone text not null,\n  quantity integer not null check (quantity > 0),\n  payment_method text not null default 'cash',\n  payment_status text not null default 'pending',\n  delivery_status text not null default 'reserved',\n  phone_verified boolean not null default true,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists reservations_day_idx on reservations (service_day_id);\ncreate index if not exists reservations_phone_idx on reservations (phone);\n\ncreate table if not exists sms_challenges (\n  id serial primary key,\n  phone text not null,\n  code_hash text not null,\n  name text not null,\n  quantity integer not null,\n  payment_method text not null,\n  service_day_id integer not null references service_days(id) on delete cascade,\n  expires_at timestamptz not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists sms_challenges_phone_idx on sms_challenges (phone);\n\ncreate table if not exists admin_sessions (\n  token text primary key,\n  created_at timestamptz not null default now(),\n  expires_at timestamptz not null\n);\n";
var _0003_debts_dishes_default = "-- Debts ledger (open / paid / removed) and extra dish tiles for admin\n\ncreate table if not exists debts (\n  id serial primary key,\n  reservation_id integer references reservations(id) on delete set null,\n  name text not null,\n  phone text not null,\n  amount_cents integer not null default 1000,\n  service_date date not null,\n  status text not null default 'open',\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists debts_status_idx on debts (status);\ncreate index if not exists debts_reservation_idx on debts (reservation_id);\n\ncreate table if not exists custom_dishes (\n  id serial primary key,\n  name text not null,\n  photo_url text,\n  notes text,\n  created_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_schema.sql": _0002_schema_default,
			"/migrations/0003_debts_dishes.sql": _0003_debts_dishes_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function normalizePhone(input) {
	const digits = input.replace(/\D/g, "");
	if (digits.length === 10) return `+1${digits}`;
	if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
	return null;
}
function formatPhone(e164) {
	const digits = e164.replace(/\D/g, "");
	const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
	if (ten.length !== 10) return e164;
	return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}
var DEMO_PASSWORD_HASH = "hoyhay-demo-salt:7a0b67f795afe59d0f69afdc960764d1a1fbe507fdc1076f847f089cf1f71dd4";
var ADMIN_COOKIE = "hoyhay_admin";
function hashSmsCode(phone, code) {
	return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}
function hashPassword(password, salt) {
	return scryptSync(password, salt, 32).toString("hex");
}
function verifyPassword(password, stored) {
	const sep = stored.indexOf(":");
	if (sep < 0) return false;
	const salt = stored.slice(0, sep);
	const expected = stored.slice(sep + 1);
	const actual = hashPassword(password, salt);
	if (actual.length !== expected.length) return false;
	try {
		return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
	} catch {
		return false;
	}
}
function asIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return (/* @__PURE__ */ new Date()).toISOString();
}
function ymdOf(value) {
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value).slice(0, 10);
}
async function reservedQty(sql, dayId) {
	const rows = await sql`
    select coalesce(sum(quantity), 0)::int as qty
    from reservations
    where service_day_id = ${dayId}
      and delivery_status <> 'cancelled'
  `;
	return Number(rows[0]?.qty ?? 0);
}
async function reservedByPhone(sql, dayId, phone) {
	const rows = await sql`
    select coalesce(sum(quantity), 0)::int as qty
    from reservations
    where service_day_id = ${dayId}
      and phone = ${phone}
      and delivery_status <> 'cancelled'
  `;
	return Number(rows[0]?.qty ?? 0);
}
function moneyTotals(reservations, capacity, priceCents, debts = []) {
	const billable = reservations.filter((r) => r.deliveryStatus !== "cancelled" && r.deliveryStatus !== "noshow");
	const platesReserved = reservations.filter((r) => r.deliveryStatus !== "cancelled").reduce((n, r) => n + r.quantity, 0);
	const platesDelivered = reservations.filter((r) => r.deliveryStatus === "delivered").reduce((n, r) => n + r.quantity, 0);
	const platesNoshow = reservations.filter((r) => r.deliveryStatus === "noshow").reduce((n, r) => n + r.quantity, 0);
	const collectedPlates = billable.filter((r) => r.paymentStatus === "cash" || r.paymentStatus === "online").reduce((n, r) => n + r.quantity, 0);
	const pendingPlates = billable.filter((r) => r.paymentStatus === "pending").reduce((n, r) => n + r.quantity, 0);
	const openDebtCents = debts.filter((d) => d.status === "open").reduce((n, d) => n + d.amountCents, 0);
	const paidManualCents = debts.filter((d) => d.status === "paid" && d.reservationId == null).reduce((n, d) => n + d.amountCents, 0);
	return {
		platesReserved,
		platesDelivered,
		platesNoshow,
		capacity,
		collectedCents: collectedPlates * priceCents + paidManualCents,
		pendingCents: pendingPlates * priceCents,
		debtCents: openDebtCents,
		potentialCents: platesReserved * priceCents
	};
}
function mapDebt(row) {
	const serviceDate = ymdOf(row.service_date);
	return {
		id: row.id,
		reservationId: row.reservation_id,
		name: row.name,
		phone: row.phone,
		phoneDisplay: formatPhone(row.phone),
		amountCents: row.amount_cents,
		serviceDate,
		dateLabel: dateLabel(serviceDate),
		status: row.status || "open"
	};
}
async function loadDebts(sql) {
	return (await sql`
    select * from debts
    where status <> 'removed'
    order by created_at desc
  `).map(mapDebt);
}
async function loadCustomDishes(sql) {
	return (await sql`
    select * from custom_dishes order by created_at asc
  `).map((row) => ({
		id: row.id,
		name: row.name,
		photo: row.photo_url,
		notes: row.notes ?? ""
	}));
}
async function upsertReservationDebt(sql, row, serviceDate, priceCents) {
	const existing = await sql`
    select id from debts
    where reservation_id = ${row.id} and status = 'open'
    limit 1
  `;
	const amount = row.quantity * priceCents;
	if (existing[0]) {
		await sql`
      update debts
      set amount_cents = ${amount},
          name = ${row.name},
          phone = ${row.phone},
          updated_at = now()
      where id = ${existing[0].id}
    `;
		return;
	}
	await sql`
    insert into debts (reservation_id, name, phone, amount_cents, service_date, status)
    values (${row.id}, ${row.name}, ${row.phone}, ${amount}, ${serviceDate}, 'open')
  `;
}
async function closeLinkedDebt(sql, reservationId, status) {
	await sql`
    update debts
    set status = ${status}, updated_at = now()
    where reservation_id = ${reservationId} and status = 'open'
  `;
}
function mapReservation(row) {
	const createdAt = asIso(row.created_at);
	return {
		id: row.id,
		name: row.name,
		phone: row.phone,
		phoneDisplay: formatPhone(row.phone),
		quantity: row.quantity,
		paymentMethod: row.payment_method || "cash",
		paymentStatus: row.payment_status || "pending",
		deliveryStatus: row.delivery_status || "reserved",
		createdAt,
		timeLabel: timeLabelFromIso(createdAt)
	};
}
function toPublicDay(row, reserved) {
	const serviceDate = ymdOf(row.service_date);
	return {
		id: row.id,
		serviceDate,
		weekdayLabel: weekdayLabel(serviceDate),
		dateLabel: dateLabel(serviceDate),
		dishName: row.dish_name,
		photoUrl: row.photo_url,
		notes: row.notes,
		capacity: row.capacity,
		remaining: Math.max(0, row.capacity - reserved),
		reserved,
		priceCents: row.price_cents,
		status: row.status,
		cancelMessage: row.cancel_message
	};
}
async function getSettings(sql) {
	const row = (await sql`select * from settings where id = 1`)[0];
	if (!row) throw new Error("settings missing");
	return row;
}
async function pickActiveDay(sql, today) {
	const rows = await sql`
    select * from service_days
    where service_date >= ${today}
    order by service_date asc
    limit 1
  `;
	if (rows[0]) return rows[0];
	return (await sql`
    select * from service_days
    order by service_date desc
    limit 1
  `)[0] ?? null;
}
async function seedIfNeeded(sql) {
	if ((await sql`select id from settings where id = 1`).length === 0) await sql`
      insert into settings (
        id, max_per_person, capacity, price_cents, timezone, cutoff_hour,
        leftover_end_hour, admin_username, admin_password_hash, sms_enabled
      ) values (
        1, ${3}, ${10}, ${PRICE_CENTS},
        ${TIMEZONE}, 8, 15, 'admin', ${DEMO_PASSWORD_HASH}, false
      )
    `;
	const days = await sql`select count(*)::int as n from service_days`;
	if (Number(days[0]?.n ?? 0) > 0) return;
	const clock = readClock();
	const serviceDate = nextServiceDate(clock);
	const pastor = DISH_PRESETS[0];
	const dayId = (await sql`
    insert into service_days (
      service_date, dish_name, photo_url, notes, capacity, price_cents, status
    ) values (
      ${serviceDate}, ${pastor.name}, ${pastor.photo}, ${pastor.notes},
      ${10}, ${PRICE_CENTS}, 'open'
    )
    returning id
  `)[0]?.id;
	if (dayId) await sql`
      insert into reservations (
        service_day_id, name, phone, quantity, payment_method,
        payment_status, delivery_status, created_at
      ) values
        (${dayId}, 'Maya R.', '+12105550114', 2, 'cash', 'pending', 'reserved', now() - interval '40 minutes'),
        (${dayId}, 'Diego P.', '+12105550188', 1, 'cash', 'pending', 'reserved', now() - interval '25 minutes')
    `;
	const history = [
		{
			offset: 1,
			preset: DISH_PRESETS[1],
			sold: 10
		},
		{
			offset: 2,
			preset: DISH_PRESETS[2],
			sold: 8
		},
		{
			offset: 3,
			preset: DISH_PRESETS[3],
			sold: 9
		},
		{
			offset: 4,
			preset: DISH_PRESETS[4],
			sold: 7
		}
	];
	let cursor = addDaysYmd(serviceDate, -1);
	for (const item of history) {
		while (isWeekend(cursor)) cursor = addDaysYmd(cursor, -1);
		await sql`
      insert into service_days (
        service_date, dish_name, photo_url, notes, capacity, price_cents, status
      ) values (
        ${cursor}, ${item.preset.name}, ${item.preset.photo}, ${item.preset.notes},
        ${10}, ${PRICE_CENTS}, 'closed'
      )
      on conflict (service_date) do nothing
    `;
		const hid = (await sql`
      select id from service_days where service_date = ${cursor}
    `)[0]?.id;
		if (hid) {
			10 - item.sold;
			if (item.sold >= 1) await sql`
          insert into reservations (
            service_day_id, name, phone, quantity, payment_method,
            payment_status, delivery_status
          ) values (
            ${hid}, 'Grupo', '+12105550000', ${item.sold}, 'cash', 'cash', 'delivered'
          )
        `;
		}
		cursor = addDaysYmd(cursor, -1);
		item.offset;
	}
}
async function loadHistory(sql, beforeDate, limit = 4) {
	const rows = await sql`
    select * from service_days
    where service_date < ${beforeDate}
      and status <> 'cancelled'
    order by service_date desc
    limit ${limit}
  `;
	const out = [];
	for (const row of rows) {
		const sold = await reservedQty(sql, row.id);
		const serviceDate = ymdOf(row.service_date);
		out.push({
			serviceDate,
			weekdayLabel: weekdayLabel(serviceDate),
			dishName: row.dish_name,
			sold: Math.min(sold, row.capacity),
			leftover: Math.max(0, row.capacity - sold)
		});
	}
	return out;
}
async function getPublicBoardData() {
	const sql = await getSql();
	await seedIfNeeded(sql);
	const settings = await getSettings(sql);
	const clock = readClock();
	const dayRow = await pickActiveDay(sql, clock.ymd);
	const reserved = dayRow ? await reservedQty(sql, dayRow.id) : 0;
	const day = dayRow ? toPublicDay(dayRow, reserved) : null;
	const override = settings.phase_override === "early" || settings.phase_override === "leftover" ? settings.phase_override : null;
	const phase = computePhase({
		clock,
		serviceDate: day?.serviceDate ?? null,
		status: day?.status ?? null,
		cutoffHour: settings.cutoff_hour,
		leftoverEndHour: settings.leftover_end_hour,
		override
	});
	const historyAnchor = day?.serviceDate ?? clock.ymd;
	return {
		now: clock,
		phase,
		day,
		lastPlates: Boolean(day && day.remaining > 0 && day.remaining <= 3),
		maxPerPerson: settings.max_per_person,
		history: await loadHistory(sql, historyAnchor),
		smsMode: settings.sms_enabled ? "live" : "demo"
	};
}
async function startReserveData(input) {
	const sql = await getSql();
	await seedIfNeeded(sql);
	const name = input.name.trim();
	if (name.length < 2) throw new Error("Pon tu nombre.");
	const phone = normalizePhone(input.phone);
	if (!phone) throw new Error("Pon un número de EE.UU. de 10 dígitos.");
	const settings = await getSettings(sql);
	const qty = Math.floor(input.quantity);
	if (qty < 1 || qty > settings.max_per_person) throw new Error(`Máximo ${settings.max_per_person} por persona.`);
	const clock = readClock();
	const dayRow = await pickActiveDay(sql, clock.ymd);
	if (!dayRow || dayRow.status !== "open") throw new Error("Hoy no hay reservas.");
	const override = settings.phase_override === "early" || settings.phase_override === "leftover" ? settings.phase_override : null;
	const phase = computePhase({
		clock,
		serviceDate: ymdOf(dayRow.service_date),
		status: dayRow.status,
		cutoffHour: settings.cutoff_hour,
		leftoverEndHour: settings.leftover_end_hour,
		override
	});
	if (phase === "ended" || phase === "cancelled" || phase === "empty") throw new Error("Ya cerramos las reservas.");
	const reserved = await reservedQty(sql, dayRow.id);
	const remaining = dayRow.capacity - reserved;
	if (qty > remaining) throw new Error(remaining <= 0 ? "Agotado." : `Solo quedan ${remaining}.`);
	const already = await reservedByPhone(sql, dayRow.id, phone);
	if (already + qty > settings.max_per_person) throw new Error(already >= settings.max_per_person ? "Ya llegaste al tope con este número." : `Con este número solo puedes pedir ${settings.max_per_person - already} más.`);
	const code = String(randomInt(1e5, 1e6));
	const codeHash = hashSmsCode(phone, code);
	await sql`delete from sms_challenges where phone = ${phone} or expires_at < now()`;
	const challengeId = (await sql`
    insert into sms_challenges (
      phone, code_hash, name, quantity, payment_method, service_day_id, expires_at
    ) values (
      ${phone}, ${codeHash}, ${name}, ${qty}, ${input.paymentMethod},
      ${dayRow.id}, now() + interval '10 minutes'
    )
    returning id
  `)[0]?.id;
	if (!challengeId) throw new Error("No se pudo crear el código.");
	return {
		challengeId,
		demoCode: settings.sms_enabled ? null : code,
		expiresInSec: 600
	};
}
async function confirmReserveData(input) {
	const sql = await getSql();
	const code = input.code.replace(/\s/g, "");
	if (!/^\d{4,6}$/.test(code)) throw new Error("Código inválido.");
	const challenge = (await sql`
    select * from sms_challenges where id = ${input.challengeId}
  `)[0];
	if (!challenge) throw new Error("El código ya no vale. Pide uno nuevo.");
	if (new Date(asIso(challenge.expires_at)).getTime() < Date.now()) {
		await sql`delete from sms_challenges where id = ${challenge.id}`;
		throw new Error("El código caducó. Pide uno nuevo.");
	}
	if (hashSmsCode(challenge.phone, code) !== challenge.code_hash) throw new Error("Ese código no coincide.");
	const day = (await sql`select * from service_days where id = ${challenge.service_day_id}`)[0];
	if (!day || day.status !== "open") throw new Error("Hoy no hay reservas.");
	const settings = await getSettings(sql);
	const reserved = await reservedQty(sql, day.id);
	if (challenge.quantity > day.capacity - reserved) throw new Error("Se acabaron mientras confirmabas.");
	if (await reservedByPhone(sql, day.id, challenge.phone) + challenge.quantity > settings.max_per_person) throw new Error("Ya llegaste al tope con este número.");
	const inserted = await sql`
    insert into reservations (
      service_day_id, name, phone, quantity, payment_method,
      payment_status, delivery_status, phone_verified
    ) values (
      ${day.id}, ${challenge.name}, ${challenge.phone}, ${challenge.quantity},
      ${challenge.payment_method}, 'pending', 'reserved', true
    )
    returning id
  `;
	await sql`delete from sms_challenges where id = ${challenge.id}`;
	const reservationId = inserted[0]?.id;
	if (!reservationId) throw new Error("No se pudo guardar la reserva.");
	const after = await reservedQty(sql, day.id);
	if (after > day.capacity) {
		await sql`delete from reservations where id = ${reservationId}`;
		throw new Error("Agotado.");
	}
	return {
		reservationId,
		remaining: Math.max(0, day.capacity - after),
		dishName: day.dish_name,
		quantity: challenge.quantity
	};
}
async function readAdminToken() {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
	return getCookie(ADMIN_COOKIE) ?? null;
}
async function setAdminCookie(token) {
	const { setCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
	setCookie(ADMIN_COOKIE, token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: true,
		maxAge: 1209600
	});
}
async function clearAdminCookie() {
	const { setCookie } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
	setCookie(ADMIN_COOKIE, "", {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0
	});
}
async function requireAdmin(sql) {
	const token = await readAdminToken();
	if (!token) throw new Error("UNAUTHORIZED");
	if (!(await sql`
    select token from admin_sessions
    where token = ${token} and expires_at > now()
  `)[0]) throw new Error("UNAUTHORIZED");
}
async function loginAdminData(input) {
	const sql = await getSql();
	await seedIfNeeded(sql);
	const settings = await getSettings(sql);
	const userOk = input.username.trim().toLowerCase() === settings.admin_username.toLowerCase();
	const passOk = verifyPassword(input.password, settings.admin_password_hash);
	if (!userOk || !passOk) throw new Error("Usuario o contraseña incorrectos.");
	const token = randomBytes(24).toString("hex");
	await sql`
    insert into admin_sessions (token, expires_at)
    values (${token}, now() + interval '14 days')
  `;
	await sql`delete from admin_sessions where expires_at < now()`;
	await setAdminCookie(token);
	return { ok: true };
}
async function logoutAdminData() {
	const sql = await getSql();
	const token = await readAdminToken();
	if (token) await sql`delete from admin_sessions where token = ${token}`;
	await clearAdminCookie();
	return { ok: true };
}
async function buildAdminDay(sql, row, debts = []) {
	const reservations = (await sql`
    select * from reservations
    where service_day_id = ${row.id}
    order by created_at asc
  `).map(mapReservation);
	const reserved = reservations.filter((r) => r.deliveryStatus !== "cancelled").reduce((n, r) => n + r.quantity, 0);
	const serviceDate = ymdOf(row.service_date);
	return {
		id: row.id,
		serviceDate,
		weekdayLabel: weekdayLabel(serviceDate),
		dateLabel: dateLabel(serviceDate),
		dishName: row.dish_name,
		photoUrl: row.photo_url,
		notes: row.notes,
		capacity: row.capacity,
		priceCents: row.price_cents,
		status: row.status,
		cancelMessage: row.cancel_message,
		remaining: Math.max(0, row.capacity - reserved),
		reserved,
		reservations,
		totals: moneyTotals(reservations, row.capacity, row.price_cents, debts)
	};
}
async function getAdminBoardData() {
	const sql = await getSql();
	await seedIfNeeded(sql);
	try {
		await requireAdmin(sql);
	} catch {
		return {
			authenticated: false,
			now: readClock(),
			phase: "empty",
			phaseOverride: null,
			maxPerPerson: 3,
			defaultCapacity: 10,
			priceCents: PRICE_CENTS,
			smsEnabled: false,
			day: null,
			upcoming: [],
			history: [],
			debts: [],
			customDishes: []
		};
	}
	const settings = await getSettings(sql);
	const clock = readClock();
	const debts = await loadDebts(sql);
	const customDishes = await loadCustomDishes(sql);
	const dayRow = await pickActiveDay(sql, clock.ymd);
	const day = dayRow ? await buildAdminDay(sql, dayRow, debts) : null;
	const override = settings.phase_override === "early" || settings.phase_override === "leftover" ? settings.phase_override : null;
	const phase = computePhase({
		clock,
		serviceDate: day?.serviceDate ?? null,
		status: day?.status ?? null,
		cutoffHour: settings.cutoff_hour,
		leftoverEndHour: settings.leftover_end_hour,
		override
	});
	const upcomingRows = await sql`
    select * from service_days
    where service_date >= ${clock.ymd}
    order by service_date asc
    limit 5
  `;
	const upcoming = [];
	for (const row of upcomingRows) {
		const reserved = await reservedQty(sql, row.id);
		upcoming.push({
			id: row.id,
			serviceDate: ymdOf(row.service_date),
			dishName: row.dish_name,
			status: row.status,
			remaining: Math.max(0, row.capacity - reserved),
			capacity: row.capacity
		});
	}
	const historyRows = await sql`
    select * from service_days
    where service_date < ${clock.ymd}
    order by service_date desc
    limit 12
  `;
	const history = [];
	for (const row of historyRows) {
		const adminDay = await buildAdminDay(sql, row);
		history.push({
			id: row.id,
			serviceDate: adminDay.serviceDate,
			weekdayLabel: adminDay.weekdayLabel,
			dishName: adminDay.dishName,
			sold: adminDay.reserved,
			leftover: adminDay.remaining,
			collectedCents: adminDay.totals.collectedCents,
			status: adminDay.status
		});
	}
	return {
		authenticated: true,
		now: clock,
		phase,
		phaseOverride: override,
		maxPerPerson: settings.max_per_person,
		defaultCapacity: settings.capacity,
		priceCents: settings.price_cents,
		smsEnabled: Boolean(settings.sms_enabled),
		day,
		upcoming,
		history,
		debts: debts.filter((d) => d.status === "open"),
		customDishes
	};
}
async function publishDayData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const dishName = input.dishName.trim();
	if (dishName.length < 2) throw new Error("Pon el nombre del platillo.");
	if (!/^\d{4}-\d{2}-\d{2}$/.test(input.serviceDate)) throw new Error("Fecha inválida.");
	const settings = await getSettings(sql);
	const capacity = Math.max(1, Math.min(40, Math.floor(input.capacity || settings.capacity)));
	const notes = input.notes.trim() || null;
	const photoUrl = input.photoUrl?.trim() || null;
	const existing = await sql`
    select * from service_days where service_date = ${input.serviceDate}
  `;
	if (existing[0]) {
		const reserved = await reservedQty(sql, existing[0].id);
		if (capacity < reserved) throw new Error(`Ya hay ${reserved} reservados. No bajes la capacidad de eso.`);
		await sql`
      update service_days
      set dish_name = ${dishName},
          photo_url = ${photoUrl},
          notes = ${notes},
          capacity = ${capacity},
          status = 'open',
          cancel_message = null
      where id = ${existing[0].id}
    `;
		return { id: existing[0].id };
	}
	const id = (await sql`
    insert into service_days (
      service_date, dish_name, photo_url, notes, capacity, price_cents, status
    ) values (
      ${input.serviceDate}, ${dishName}, ${photoUrl}, ${notes},
      ${capacity}, ${settings.price_cents}, 'open'
    )
    returning id
  `)[0]?.id;
	if (!id) throw new Error("No se pudo publicar.");
	return { id };
}
async function cancelDayData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const dayRow = await pickActiveDay(sql, readClock().ymd);
	if (!dayRow) throw new Error("No hay un día activo.");
	await sql`
    update service_days
    set status = 'cancelled', cancel_message = ${input.message.trim() || "Hoy no voy. Tu reserva queda cancelada."}
    where id = ${dayRow.id}
  `;
	const people = await sql`
    select count(*)::int as n from reservations
    where service_day_id = ${dayRow.id} and delivery_status <> 'cancelled'
  `;
	return {
		ok: true,
		wouldNotify: Number(people[0]?.n ?? 0)
	};
}
async function closeDayData() {
	const sql = await getSql();
	await requireAdmin(sql);
	const dayRow = await pickActiveDay(sql, readClock().ymd);
	if (!dayRow) throw new Error("No hay un día activo.");
	await sql`update service_days set status = 'closed' where id = ${dayRow.id}`;
	return { ok: true };
}
async function updateReservationData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const rows = await sql`select * from reservations where id = ${input.id}`;
	if (!rows[0]) throw new Error("Reserva no encontrada.");
	const paymentStatus = input.paymentStatus ?? rows[0].payment_status;
	const deliveryStatus = input.deliveryStatus ?? rows[0].delivery_status;
	await sql`
    update reservations
    set payment_status = ${paymentStatus},
        delivery_status = ${deliveryStatus}
    where id = ${input.id}
  `;
	const updated = {
		...rows[0],
		payment_status: paymentStatus,
		delivery_status: deliveryStatus
	};
	const dayRows = await sql`
    select service_date, price_cents from service_days where id = ${updated.service_day_id}
  `;
	const serviceDate = ymdOf(dayRows[0]?.service_date ?? readClock().ymd);
	const priceCents = Number(dayRows[0]?.price_cents ?? 1e3);
	if (deliveryStatus === "noshow") await closeLinkedDebt(sql, updated.id, "removed");
	else if (paymentStatus === "debt") await upsertReservationDebt(sql, updated, serviceDate, priceCents);
	else if (paymentStatus === "cash" || paymentStatus === "online") await closeLinkedDebt(sql, updated.id, "paid");
	return { ok: true };
}
async function addDebtData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const name = input.name.trim();
	if (name.length < 2) throw new Error("Pon el nombre.");
	const phone = normalizePhone(input.phone);
	if (!phone) throw new Error("Pon un número de EE.UU. de 10 dígitos.");
	const qty = Math.max(1, Math.floor(input.quantity));
	const clock = readClock();
	const dayRow = await pickActiveDay(sql, clock.ymd);
	const serviceDate = dayRow ? ymdOf(dayRow.service_date) : clock.ymd;
	const id = (await sql`
    insert into debts (reservation_id, name, phone, amount_cents, service_date, status)
    values (null, ${name}, ${phone}, ${qty * (await getSettings(sql)).price_cents}, ${serviceDate}, 'open')
    returning id
  `)[0]?.id;
	if (!id) throw new Error("No se pudo guardar la deuda.");
	return { id };
}
async function adjustDebtData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const rows = await sql`select * from debts where id = ${input.id} and status = 'open'`;
	if (!rows[0]) throw new Error("Deuda no encontrada.");
	const settings = await getSettings(sql);
	await sql`
    update debts set amount_cents = ${Math.max(0, rows[0].amount_cents + input.deltaPlates * settings.price_cents)}, updated_at = now() where id = ${input.id}
  `;
	return { ok: true };
}
async function payDebtData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const rows = await sql`select * from debts where id = ${input.id} and status = 'open'`;
	if (!rows[0]) throw new Error("Deuda no encontrada.");
	await sql`update debts set status = 'paid', updated_at = now() where id = ${input.id}`;
	if (rows[0].reservation_id) await sql`
      update reservations
      set payment_status = 'cash'
      where id = ${rows[0].reservation_id}
    `;
	return { ok: true };
}
async function removeDebtData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	if (!(await sql`select * from debts where id = ${input.id} and status = 'open'`)[0]) throw new Error("Deuda no encontrada.");
	await sql`update debts set status = 'removed', updated_at = now() where id = ${input.id}`;
	return { ok: true };
}
async function saveCustomDishData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	const name = input.name.trim();
	if (name.length < 2) throw new Error("Pon el nombre del platillo.");
	const notes = input.notes.trim() || null;
	const id = (await sql`
    insert into custom_dishes (name, photo_url, notes)
    values (${name}, ${input.photoUrl?.trim() || null}, ${notes})
    returning id
  `)[0]?.id;
	if (!id) throw new Error("No se pudo guardar el platillo.");
	return { id };
}
async function deleteCustomDishData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	await sql`delete from custom_dishes where id = ${input.id}`;
	return { ok: true };
}
async function saveConfigData(input) {
	const sql = await getSql();
	await requireAdmin(sql);
	await sql`
    update settings
    set max_per_person = ${input.maxPerPerson === 2 ? 2 : 3},
        capacity = ${Math.max(1, Math.min(40, Math.floor(input.capacity)))},
        phase_override = ${input.phaseOverride},
        updated_at = now()
    where id = 1
  `;
	return { ok: true };
}
async function reminderPreviewData() {
	const sql = await getSql();
	await requireAdmin(sql);
	const dayRow = await pickActiveDay(sql, readClock().ymd);
	if (!dayRow || dayRow.status !== "open") return {
		message: "",
		recipients: []
	};
	return {
		message: `Hoy hay ${dayRow.dish_name}, te guardo tu plato. — Hoy Hay`,
		recipients: await sql`
    select name, phone from reservations
    where service_day_id = ${dayRow.id}
      and delivery_status = 'reserved'
  `
	};
}
//#endregion
export { addDebtData, adjustDebtData, cancelDayData, closeDayData, confirmReserveData, deleteCustomDishData, getAdminBoardData, getPublicBoardData, loginAdminData, logoutAdminData, payDebtData, publishDayData, reminderPreviewData, removeDebtData, saveConfigData, saveCustomDishData, startReserveData, updateReservationData };
