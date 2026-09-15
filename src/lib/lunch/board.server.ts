import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import { formatPhone, normalizePhone } from "./phone";
import { DISH_PRESETS } from "./presets";
import {
  computePhase,
  dateLabel,
  nextServiceDate,
  readClock,
  timeLabelFromIso,
  weekdayLabel,
  addDaysYmd,
  isWeekend,
} from "./time";
import {
  DEFAULT_CAPACITY,
  DEFAULT_MAX_PER_PERSON,
  LAST_PLATES_THRESHOLD,
  PRICE_CENTS,
  TIMEZONE,
  type AdminBoard,
  type AdminDay,
  type AdminReservation,
  type CustomDish,
  type DayStatus,
  type DebtItem,
  type DeliveryStatus,
  type HistoryItem,
  type MoneyTotals,
  type PaymentMethod,
  type PaymentStatus,
  type PublicBoard,
  type PublicDay,
} from "./types";

const DEMO_PASSWORD_HASH =
  "hoyhay-demo-salt:7a0b67f795afe59d0f69afdc960764d1a1fbe507fdc1076f847f089cf1f71dd4";
const ADMIN_COOKIE = "hoyhay_admin";
const SESSION_DAYS = 14;

type SettingsRow = {
  id: number;
  max_per_person: number;
  capacity: number;
  price_cents: number;
  timezone: string;
  cutoff_hour: number;
  leftover_end_hour: number;
  admin_username: string;
  admin_password_hash: string;
  vendor_phone: string | null;
  sms_enabled: boolean;
  phase_override: string | null;
};

type DayRow = {
  id: number;
  service_date: string;
  dish_name: string;
  photo_url: string | null;
  notes: string | null;
  capacity: number;
  price_cents: number;
  status: string;
  cancel_message: string | null;
  created_at: string;
};

type ReservationRow = {
  id: number;
  service_day_id: number;
  name: string;
  phone: string;
  quantity: number;
  payment_method: string;
  payment_status: string;
  delivery_status: string;
  phone_verified: boolean;
  created_at: string;
};

type DebtRow = {
  id: number;
  reservation_id: number | null;
  name: string;
  phone: string;
  amount_cents: number;
  service_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type CustomDishRow = {
  id: number;
  name: string;
  photo_url: string | null;
  notes: string | null;
};

function hashSmsCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString("hex");
}

function verifyPassword(password: string, stored: string) {
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

function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function ymdOf(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

async function reservedQty(sql: Sql, dayId: number): Promise<number> {
  const rows = await sql<{ qty: number }>`
    select coalesce(sum(quantity), 0)::int as qty
    from reservations
    where service_day_id = ${dayId}
      and delivery_status <> 'cancelled'
  `;
  return Number(rows[0]?.qty ?? 0);
}

async function reservedByPhone(sql: Sql, dayId: number, phone: string): Promise<number> {
  const rows = await sql<{ qty: number }>`
    select coalesce(sum(quantity), 0)::int as qty
    from reservations
    where service_day_id = ${dayId}
      and phone = ${phone}
      and delivery_status <> 'cancelled'
  `;
  return Number(rows[0]?.qty ?? 0);
}

function moneyTotals(
  reservations: AdminReservation[],
  capacity: number,
  priceCents: number,
  debts: DebtItem[] = [],
): MoneyTotals {
  const billable = reservations.filter(
    (r) => r.deliveryStatus !== "cancelled" && r.deliveryStatus !== "noshow",
  );
  const platesReserved = reservations
    .filter((r) => r.deliveryStatus !== "cancelled")
    .reduce((n, r) => n + r.quantity, 0);
  const platesDelivered = reservations
    .filter((r) => r.deliveryStatus === "delivered")
    .reduce((n, r) => n + r.quantity, 0);
  const platesNoshow = reservations
    .filter((r) => r.deliveryStatus === "noshow")
    .reduce((n, r) => n + r.quantity, 0);
  const collectedPlates = billable
    .filter((r) => r.paymentStatus === "cash" || r.paymentStatus === "online")
    .reduce((n, r) => n + r.quantity, 0);
  const pendingPlates = billable
    .filter((r) => r.paymentStatus === "pending")
    .reduce((n, r) => n + r.quantity, 0);
  const openDebtCents = debts
    .filter((d) => d.status === "open")
    .reduce((n, d) => n + d.amountCents, 0);
  const paidManualCents = debts
    .filter((d) => d.status === "paid" && d.reservationId == null)
    .reduce((n, d) => n + d.amountCents, 0);
  return {
    platesReserved,
    platesDelivered,
    platesNoshow,
    capacity,
    collectedCents: collectedPlates * priceCents + paidManualCents,
    pendingCents: pendingPlates * priceCents,
    debtCents: openDebtCents,
    potentialCents: platesReserved * priceCents,
  };
}

function mapDebt(row: DebtRow): DebtItem {
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
    status: (row.status as DebtItem["status"]) || "open",
  };
}

async function loadDebts(sql: Sql): Promise<DebtItem[]> {
  const rows = await sql<DebtRow>`
    select * from debts
    where status <> 'removed'
    order by created_at desc
  `;
  return rows.map(mapDebt);
}

async function loadCustomDishes(sql: Sql): Promise<CustomDish[]> {
  const rows = await sql<CustomDishRow>`
    select * from custom_dishes order by created_at asc
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    photo: row.photo_url,
    notes: row.notes ?? "",
  }));
}

async function upsertReservationDebt(
  sql: Sql,
  row: ReservationRow,
  serviceDate: string,
  priceCents: number,
): Promise<void> {
  const existing = await sql<{ id: number }>`
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

async function closeLinkedDebt(
  sql: Sql,
  reservationId: number,
  status: "paid" | "removed",
): Promise<void> {
  await sql`
    update debts
    set status = ${status}, updated_at = now()
    where reservation_id = ${reservationId} and status = 'open'
  `;
}

function mapReservation(row: ReservationRow): AdminReservation {
  const createdAt = asIso(row.created_at);
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    phoneDisplay: formatPhone(row.phone),
    quantity: row.quantity,
    paymentMethod: (row.payment_method as PaymentMethod) || "cash",
    paymentStatus: (row.payment_status as PaymentStatus) || "pending",
    deliveryStatus: (row.delivery_status as DeliveryStatus) || "reserved",
    createdAt,
    timeLabel: timeLabelFromIso(createdAt),
  };
}

function toPublicDay(row: DayRow, reserved: number): PublicDay {
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
    status: row.status as DayStatus,
    cancelMessage: row.cancel_message,
  };
}

async function getSettings(sql: Sql): Promise<SettingsRow> {
  const rows = await sql<SettingsRow>`select * from settings where id = 1`;
  const row = rows[0];
  if (!row) throw new Error("settings missing");
  return row;
}

async function pickActiveDay(sql: Sql, today: string): Promise<DayRow | null> {
  const rows = await sql<DayRow>`
    select * from service_days
    where service_date >= ${today}
    order by service_date asc
    limit 1
  `;
  if (rows[0]) return rows[0];
  const past = await sql<DayRow>`
    select * from service_days
    order by service_date desc
    limit 1
  `;
  return past[0] ?? null;
}

async function seedIfNeeded(sql: Sql): Promise<void> {
  const existing = await sql<{ id: number }>`select id from settings where id = 1`;
  if (existing.length === 0) {
    await sql`
      insert into settings (
        id, max_per_person, capacity, price_cents, timezone, cutoff_hour,
        leftover_end_hour, admin_username, admin_password_hash, sms_enabled
      ) values (
        1, ${DEFAULT_MAX_PER_PERSON}, ${DEFAULT_CAPACITY}, ${PRICE_CENTS},
        ${TIMEZONE}, 8, 15, 'admin', ${DEMO_PASSWORD_HASH}, false
      )
    `;
  }

  const days = await sql<{ n: number }>`select count(*)::int as n from service_days`;
  if (Number(days[0]?.n ?? 0) > 0) return;

  const clock = readClock();
  const serviceDate = nextServiceDate(clock);
  const pastor = DISH_PRESETS[0];

  const inserted = await sql<{ id: number }>`
    insert into service_days (
      service_date, dish_name, photo_url, notes, capacity, price_cents, status
    ) values (
      ${serviceDate}, ${pastor.name}, ${pastor.photo}, ${pastor.notes},
      ${DEFAULT_CAPACITY}, ${PRICE_CENTS}, 'open'
    )
    returning id
  `;
  const dayId = inserted[0]?.id;
  if (dayId) {
    await sql`
      insert into reservations (
        service_day_id, name, phone, quantity, payment_method,
        payment_status, delivery_status, created_at
      ) values
        (${dayId}, 'Maya R.', '+12105550114', 2, 'cash', 'pending', 'reserved', now() - interval '40 minutes'),
        (${dayId}, 'Diego P.', '+12105550188', 1, 'cash', 'pending', 'reserved', now() - interval '25 minutes')
    `;
  }

  const history: Array<{ offset: number; preset: (typeof DISH_PRESETS)[number]; sold: number }> = [
    { offset: 1, preset: DISH_PRESETS[1], sold: 10 },
    { offset: 2, preset: DISH_PRESETS[2], sold: 8 },
    { offset: 3, preset: DISH_PRESETS[3], sold: 9 },
    { offset: 4, preset: DISH_PRESETS[4], sold: 7 },
  ];

  let cursor = addDaysYmd(serviceDate, -1);
  for (const item of history) {
    while (isWeekend(cursor)) cursor = addDaysYmd(cursor, -1);
    await sql`
      insert into service_days (
        service_date, dish_name, photo_url, notes, capacity, price_cents, status
      ) values (
        ${cursor}, ${item.preset.name}, ${item.preset.photo}, ${item.preset.notes},
        ${DEFAULT_CAPACITY}, ${PRICE_CENTS}, 'closed'
      )
      on conflict (service_date) do nothing
    `;
    const dayRows = await sql<{ id: number }>`
      select id from service_days where service_date = ${cursor}
    `;
    const hid = dayRows[0]?.id;
    if (hid) {
      const leftover = DEFAULT_CAPACITY - item.sold;
      if (item.sold >= 1) {
        await sql`
          insert into reservations (
            service_day_id, name, phone, quantity, payment_method,
            payment_status, delivery_status
          ) values (
            ${hid}, 'Grupo', '+12105550000', ${item.sold}, 'cash', 'cash', 'delivered'
          )
        `;
      }
      void leftover;
    }
    cursor = addDaysYmd(cursor, -1);
    void item.offset;
  }
}

async function loadHistory(sql: Sql, beforeDate: string, limit = 4): Promise<HistoryItem[]> {
  const rows = await sql<DayRow>`
    select * from service_days
    where service_date < ${beforeDate}
      and status <> 'cancelled'
    order by service_date desc
    limit ${limit}
  `;
  const out: HistoryItem[] = [];
  for (const row of rows) {
    const sold = await reservedQty(sql, row.id);
    const serviceDate = ymdOf(row.service_date);
    out.push({
      serviceDate,
      weekdayLabel: weekdayLabel(serviceDate),
      dishName: row.dish_name,
      sold: Math.min(sold, row.capacity),
      leftover: Math.max(0, row.capacity - sold),
    });
  }
  return out;
}

export async function getPublicBoardData(): Promise<PublicBoard> {
  const sql = await getSql();
  await seedIfNeeded(sql);
  const settings = await getSettings(sql);
  const clock = readClock();
  const dayRow = await pickActiveDay(sql, clock.ymd);
  const reserved = dayRow ? await reservedQty(sql, dayRow.id) : 0;
  const day = dayRow ? toPublicDay(dayRow, reserved) : null;
  const override =
    settings.phase_override === "early" || settings.phase_override === "leftover"
      ? settings.phase_override
      : null;
  const phase = computePhase({
    clock,
    serviceDate: day?.serviceDate ?? null,
    status: day?.status ?? null,
    cutoffHour: settings.cutoff_hour,
    leftoverEndHour: settings.leftover_end_hour,
    override,
  });
  const historyAnchor = day?.serviceDate ?? clock.ymd;
  return {
    now: clock,
    phase,
    day,
    lastPlates: Boolean(day && day.remaining > 0 && day.remaining <= LAST_PLATES_THRESHOLD),
    maxPerPerson: settings.max_per_person,
    history: await loadHistory(sql, historyAnchor),
    smsMode: settings.sms_enabled ? "live" : "demo",
  };
}

export async function startReserveData(input: {
  name: string;
  phone: string;
  quantity: number;
  paymentMethod: PaymentMethod;
}): Promise<{ challengeId: number; demoCode: string | null; expiresInSec: number }> {
  const sql = await getSql();
  await seedIfNeeded(sql);
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Pon tu nombre.");
  const phone = normalizePhone(input.phone);
  if (!phone) throw new Error("Pon un número de EE.UU. de 10 dígitos.");
  const settings = await getSettings(sql);
  const qty = Math.floor(input.quantity);
  if (qty < 1 || qty > settings.max_per_person) {
    throw new Error(`Máximo ${settings.max_per_person} por persona.`);
  }
  const clock = readClock();
  const dayRow = await pickActiveDay(sql, clock.ymd);
  if (!dayRow || dayRow.status !== "open") {
    throw new Error("Hoy no hay reservas.");
  }
  const override =
    settings.phase_override === "early" || settings.phase_override === "leftover"
      ? settings.phase_override
      : null;
  const phase = computePhase({
    clock,
    serviceDate: ymdOf(dayRow.service_date),
    status: dayRow.status,
    cutoffHour: settings.cutoff_hour,
    leftoverEndHour: settings.leftover_end_hour,
    override,
  });
  if (phase === "ended" || phase === "cancelled" || phase === "empty") {
    throw new Error("Ya cerramos las reservas.");
  }
  const reserved = await reservedQty(sql, dayRow.id);
  const remaining = dayRow.capacity - reserved;
  if (qty > remaining) {
    throw new Error(remaining <= 0 ? "Agotado." : `Solo quedan ${remaining}.`);
  }
  const already = await reservedByPhone(sql, dayRow.id, phone);
  if (already + qty > settings.max_per_person) {
    throw new Error(
      already >= settings.max_per_person
        ? "Ya llegaste al tope con este número."
        : `Con este número solo puedes pedir ${settings.max_per_person - already} más.`,
    );
  }

  const code = String(randomInt(100000, 1000000));
  const codeHash = hashSmsCode(phone, code);
  await sql`delete from sms_challenges where phone = ${phone} or expires_at < now()`;
  const inserted = await sql<{ id: number }>`
    insert into sms_challenges (
      phone, code_hash, name, quantity, payment_method, service_day_id, expires_at
    ) values (
      ${phone}, ${codeHash}, ${name}, ${qty}, ${input.paymentMethod},
      ${dayRow.id}, now() + interval '10 minutes'
    )
    returning id
  `;
  const challengeId = inserted[0]?.id;
  if (!challengeId) throw new Error("No se pudo crear el código.");

  // TODO(SMS): send via Twilio Verify / Messages:
  //   client.messages.create({ to: phone, body: `Hoy Hay código: ${code}` })
  // When TWILIO_* env is present, set sms_enabled=true and stop returning demoCode.
  const demoCode = settings.sms_enabled ? null : code;

  return { challengeId, demoCode, expiresInSec: 10 * 60 };
}

export async function confirmReserveData(input: {
  challengeId: number;
  code: string;
}): Promise<{ reservationId: number; remaining: number; dishName: string; quantity: number }> {
  const sql = await getSql();
  const code = input.code.replace(/\s/g, "");
  if (!/^\d{4,6}$/.test(code)) throw new Error("Código inválido.");

  const challenges = await sql<{
    id: number;
    phone: string;
    code_hash: string;
    name: string;
    quantity: number;
    payment_method: string;
    service_day_id: number;
    expires_at: string;
  }>`
    select * from sms_challenges where id = ${input.challengeId}
  `;
  const challenge = challenges[0];
  if (!challenge) throw new Error("El código ya no vale. Pide uno nuevo.");
  if (new Date(asIso(challenge.expires_at)).getTime() < Date.now()) {
    await sql`delete from sms_challenges where id = ${challenge.id}`;
    throw new Error("El código caducó. Pide uno nuevo.");
  }
  const expected = hashSmsCode(challenge.phone, code);
  if (expected !== challenge.code_hash) {
    throw new Error("Ese código no coincide.");
  }

  const days = await sql<DayRow>`select * from service_days where id = ${challenge.service_day_id}`;
  const day = days[0];
  if (!day || day.status !== "open") throw new Error("Hoy no hay reservas.");

  const settings = await getSettings(sql);
  const reserved = await reservedQty(sql, day.id);
  if (challenge.quantity > day.capacity - reserved) {
    throw new Error("Se acabaron mientras confirmabas.");
  }
  const already = await reservedByPhone(sql, day.id, challenge.phone);
  if (already + challenge.quantity > settings.max_per_person) {
    throw new Error("Ya llegaste al tope con este número.");
  }

  const inserted = await sql<{ id: number }>`
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
    quantity: challenge.quantity,
  };
}

export async function readAdminToken(): Promise<string | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(ADMIN_COOKIE) ?? null;
}

export async function setAdminCookie(token: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(ADMIN_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearAdminCookie() {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(ADMIN_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function requireAdmin(sql: Sql): Promise<void> {
  const token = await readAdminToken();
  if (!token) throw new Error("UNAUTHORIZED");
  const rows = await sql<{ token: string }>`
    select token from admin_sessions
    where token = ${token} and expires_at > now()
  `;
  if (!rows[0]) throw new Error("UNAUTHORIZED");
}

export async function loginAdminData(input: {
  username: string;
  password: string;
}): Promise<{ ok: true }> {
  const sql = await getSql();
  await seedIfNeeded(sql);
  const settings = await getSettings(sql);
  const userOk =
    input.username.trim().toLowerCase() === settings.admin_username.toLowerCase();
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

export async function logoutAdminData(): Promise<{ ok: true }> {
  const sql = await getSql();
  const token = await readAdminToken();
  if (token) {
    await sql`delete from admin_sessions where token = ${token}`;
  }
  await clearAdminCookie();
  return { ok: true };
}

async function buildAdminDay(
  sql: Sql,
  row: DayRow,
  debts: DebtItem[] = [],
): Promise<AdminDay> {
  const resRows = await sql<ReservationRow>`
    select * from reservations
    where service_day_id = ${row.id}
    order by created_at asc
  `;
  const reservations = resRows.map(mapReservation);
  const reserved = reservations
    .filter((r) => r.deliveryStatus !== "cancelled")
    .reduce((n, r) => n + r.quantity, 0);
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
    status: row.status as DayStatus,
    cancelMessage: row.cancel_message,
    remaining: Math.max(0, row.capacity - reserved),
    reserved,
    reservations,
    totals: moneyTotals(reservations, row.capacity, row.price_cents, debts),
  };
}

export async function getAdminBoardData(): Promise<AdminBoard> {
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
      maxPerPerson: DEFAULT_MAX_PER_PERSON,
      defaultCapacity: DEFAULT_CAPACITY,
      priceCents: PRICE_CENTS,
      smsEnabled: false,
      day: null,
      upcoming: [],
      history: [],
      debts: [],
      customDishes: [],
    };
  }

  const settings = await getSettings(sql);
  const clock = readClock();
  const debts = await loadDebts(sql);
  const customDishes = await loadCustomDishes(sql);
  const dayRow = await pickActiveDay(sql, clock.ymd);
  const day = dayRow ? await buildAdminDay(sql, dayRow, debts) : null;
  const override =
    settings.phase_override === "early" || settings.phase_override === "leftover"
      ? settings.phase_override
      : null;
  const phase = computePhase({
    clock,
    serviceDate: day?.serviceDate ?? null,
    status: day?.status ?? null,
    cutoffHour: settings.cutoff_hour,
    leftoverEndHour: settings.leftover_end_hour,
    override,
  });

  const upcomingRows = await sql<DayRow>`
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
      status: row.status as DayStatus,
      remaining: Math.max(0, row.capacity - reserved),
      capacity: row.capacity,
    });
  }

  const historyRows = await sql<DayRow>`
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
      status: adminDay.status,
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
    customDishes,
  };
}

export async function publishDayData(input: {
  serviceDate: string;
  dishName: string;
  photoUrl: string | null;
  notes: string;
  capacity: number;
}): Promise<{ id: number }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const dishName = input.dishName.trim();
  if (dishName.length < 2) throw new Error("Pon el nombre del platillo.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.serviceDate)) {
    throw new Error("Fecha inválida.");
  }
  const settings = await getSettings(sql);
  const capacity = Math.max(1, Math.min(40, Math.floor(input.capacity || settings.capacity)));
  const notes = input.notes.trim() || null;
  const photoUrl = input.photoUrl?.trim() || null;

  const existing = await sql<DayRow>`
    select * from service_days where service_date = ${input.serviceDate}
  `;
  if (existing[0]) {
    const reserved = await reservedQty(sql, existing[0].id);
    if (capacity < reserved) {
      throw new Error(`Ya hay ${reserved} reservados. No bajes la capacidad de eso.`);
    }
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

  const inserted = await sql<{ id: number }>`
    insert into service_days (
      service_date, dish_name, photo_url, notes, capacity, price_cents, status
    ) values (
      ${input.serviceDate}, ${dishName}, ${photoUrl}, ${notes},
      ${capacity}, ${settings.price_cents}, 'open'
    )
    returning id
  `;
  const id = inserted[0]?.id;
  if (!id) throw new Error("No se pudo publicar.");
  return { id };
}

export async function cancelDayData(input: { message: string }): Promise<{ ok: true; wouldNotify: number }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const clock = readClock();
  const dayRow = await pickActiveDay(sql, clock.ymd);
  if (!dayRow) throw new Error("No hay un día activo.");
  const message =
    input.message.trim() || "Hoy no voy. Tu reserva queda cancelada.";
  await sql`
    update service_days
    set status = 'cancelled', cancel_message = ${message}
    where id = ${dayRow.id}
  `;
  const people = await sql<{ n: number }>`
    select count(*)::int as n from reservations
    where service_day_id = ${dayRow.id} and delivery_status <> 'cancelled'
  `;
  // TODO(SMS): text each reserved phone: message
  return { ok: true, wouldNotify: Number(people[0]?.n ?? 0) };
}

export async function closeDayData(): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const clock = readClock();
  const dayRow = await pickActiveDay(sql, clock.ymd);
  if (!dayRow) throw new Error("No hay un día activo.");
  await sql`update service_days set status = 'closed' where id = ${dayRow.id}`;
  return { ok: true };
}

export async function updateReservationData(input: {
  id: number;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
}): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const rows = await sql<ReservationRow>`select * from reservations where id = ${input.id}`;
  if (!rows[0]) throw new Error("Reserva no encontrada.");
  const paymentStatus = input.paymentStatus ?? (rows[0].payment_status as PaymentStatus);
  const deliveryStatus = input.deliveryStatus ?? (rows[0].delivery_status as DeliveryStatus);
  await sql`
    update reservations
    set payment_status = ${paymentStatus},
        delivery_status = ${deliveryStatus}
    where id = ${input.id}
  `;
  const updated = { ...rows[0], payment_status: paymentStatus, delivery_status: deliveryStatus };
  const dayRows = await sql<{ service_date: string; price_cents: number }>`
    select service_date, price_cents from service_days where id = ${updated.service_day_id}
  `;
  const serviceDate = ymdOf(dayRows[0]?.service_date ?? readClock().ymd);
  const priceCents = Number(dayRows[0]?.price_cents ?? PRICE_CENTS);

  if (deliveryStatus === "noshow") {
    await closeLinkedDebt(sql, updated.id, "removed");
  } else if (paymentStatus === "debt") {
    await upsertReservationDebt(sql, updated, serviceDate, priceCents);
  } else if (paymentStatus === "cash" || paymentStatus === "online") {
    await closeLinkedDebt(sql, updated.id, "paid");
  }

  return { ok: true };
}

export async function addDebtData(input: {
  name: string;
  phone: string;
  quantity: number;
}): Promise<{ id: number }> {
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
  const settings = await getSettings(sql);
  const amount = qty * settings.price_cents;
  const inserted = await sql<{ id: number }>`
    insert into debts (reservation_id, name, phone, amount_cents, service_date, status)
    values (null, ${name}, ${phone}, ${amount}, ${serviceDate}, 'open')
    returning id
  `;
  const id = inserted[0]?.id;
  if (!id) throw new Error("No se pudo guardar la deuda.");
  return { id };
}

export async function adjustDebtData(input: {
  id: number;
  deltaPlates: number;
}): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const rows = await sql<DebtRow>`select * from debts where id = ${input.id} and status = 'open'`;
  if (!rows[0]) throw new Error("Deuda no encontrada.");
  const settings = await getSettings(sql);
  const next = Math.max(0, rows[0].amount_cents + input.deltaPlates * settings.price_cents);
  await sql`
    update debts set amount_cents = ${next}, updated_at = now() where id = ${input.id}
  `;
  return { ok: true };
}

export async function payDebtData(input: { id: number }): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const rows = await sql<DebtRow>`select * from debts where id = ${input.id} and status = 'open'`;
  if (!rows[0]) throw new Error("Deuda no encontrada.");
  await sql`update debts set status = 'paid', updated_at = now() where id = ${input.id}`;
  if (rows[0].reservation_id) {
    await sql`
      update reservations
      set payment_status = 'cash'
      where id = ${rows[0].reservation_id}
    `;
  }
  return { ok: true };
}

export async function removeDebtData(input: { id: number }): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const rows = await sql<DebtRow>`select * from debts where id = ${input.id} and status = 'open'`;
  if (!rows[0]) throw new Error("Deuda no encontrada.");
  await sql`update debts set status = 'removed', updated_at = now() where id = ${input.id}`;
  return { ok: true };
}

export async function saveCustomDishData(input: {
  name: string;
  photoUrl: string | null;
  notes: string;
}): Promise<{ id: number }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Pon el nombre del platillo.");
  const notes = input.notes.trim() || null;
  const photoUrl = input.photoUrl?.trim() || null;
  const inserted = await sql<{ id: number }>`
    insert into custom_dishes (name, photo_url, notes)
    values (${name}, ${photoUrl}, ${notes})
    returning id
  `;
  const id = inserted[0]?.id;
  if (!id) throw new Error("No se pudo guardar el platillo.");
  return { id };
}

export async function deleteCustomDishData(input: { id: number }): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  await sql`delete from custom_dishes where id = ${input.id}`;
  return { ok: true };
}

export async function saveConfigData(input: {
  maxPerPerson: number;
  capacity: number;
  phaseOverride: "early" | "leftover" | null;
}): Promise<{ ok: true }> {
  const sql = await getSql();
  await requireAdmin(sql);
  const maxPerPerson = input.maxPerPerson === 2 ? 2 : 3;
  const capacity = Math.max(1, Math.min(40, Math.floor(input.capacity)));
  const override = input.phaseOverride;
  await sql`
    update settings
    set max_per_person = ${maxPerPerson},
        capacity = ${capacity},
        phase_override = ${override},
        updated_at = now()
    where id = 1
  `;
  return { ok: true };
}

export async function reminderPreviewData(): Promise<{
  message: string;
  recipients: Array<{ name: string; phone: string }>;
}> {
  const sql = await getSql();
  await requireAdmin(sql);
  const clock = readClock();
  const dayRow = await pickActiveDay(sql, clock.ymd);
  if (!dayRow || dayRow.status !== "open") {
    return { message: "", recipients: [] };
  }
  const message = `Hoy hay ${dayRow.dish_name}, te guardo tu plato. — Hoy Hay`;
  const rows = await sql<{ name: string; phone: string }>`
    select name, phone from reservations
    where service_day_id = ${dayRow.id}
      and delivery_status = 'reserved'
  `;
  // TODO(SMS): send `message` to each phone via Twilio on a 7:15 AM cron.
  return { message, recipients: rows };
}
