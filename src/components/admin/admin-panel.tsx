import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addDebt,
  adjustDebt,
  cancelDay,
  closeDay,
  deleteCustomDish,
  getAdminBoard,
  loginAdmin,
  logoutAdmin,
  payDebt,
  publishDay,
  reminderPreview,
  removeDebt,
  saveConfig,
  saveCustomDish,
  updateReservation,
} from "@/lib/lunch/api";
import { compressImage } from "@/lib/compress-image";
import { DISH_PRESETS } from "@/lib/lunch/presets";
import { nextServiceDate, readClock } from "@/lib/lunch/time";
import { formatMoney } from "@/lib/utils";
import type {
  AdminBoard,
  AdminReservation,
  DebtItem,
  DeliveryStatus,
  PaymentStatus,
} from "@/lib/lunch/types";

type Tab = "hoy" | "deudas" | "historial" | "config";

export function AdminPanel({ initial }: { initial?: AdminBoard }) {
  const query = useQuery({
    queryKey: ["admin-board"],
    queryFn: () => getAdminBoard(),
    initialData: initial,
    refetchInterval: (q) => (q.state.data?.authenticated ? 4000 : false),
  });
  const board = query.data;

  if (!board) {
    return (
      <Shell>
        <p className="p-6 text-muted">Cargando panel…</p>
      </Shell>
    );
  }

  if (!board.authenticated) {
    return (
      <Shell>
        <LoginForm onOk={() => void query.refetch()} />
      </Shell>
    );
  }

  return (
    <Shell>
      <SignedIn board={board} onRefresh={() => void query.refetch()} />
    </Shell>
  );
}

function Shell({ children }: { children: import("react").ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-bg shadow-card">{children}</div>
  );
}

function LoginForm({ onOk }: { onOk: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex flex-col gap-4 px-5 pb-10 pt-12"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await loginAdmin({ data: { username, password } });
          onOk();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "No se pudo entrar.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Panel</p>
      <h1 className="font-display text-4xl text-ink">Hoy Hay</h1>
      <p className="text-sm text-muted">Solo el vendedor. La home no enlaza aquí.</p>

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="user">Usuario</Label>
        <Input
          id="user"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pass">Contraseña</Label>
        <Input
          id="pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-xs text-muted">Demo: admin / plato10. 2FA por SMS queda pendiente.</p>
    </form>
  );
}

function SignedIn({ board, onRefresh }: { board: AdminBoard; onRefresh: () => void }) {
  const [tab, setTab] = useState<Tab>("hoy");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-end justify-between gap-3 px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Vendedor</p>
          <h1 className="font-display text-3xl text-ink">Panel</h1>
        </div>
        <button
          type="button"
          className="h-11 text-sm font-medium text-muted"
          onClick={async () => {
            await logoutAdmin();
            onRefresh();
          }}
        >
          Salir
        </button>
      </header>

      <nav className="mx-5 grid grid-cols-4 gap-0.5 rounded-md bg-line/70 p-1">
        {(
          [
            ["hoy", "Hoy"],
            ["deudas", "Deudas"],
            ["historial", "Historial"],
            ["config", "Config"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex h-11 min-w-0 items-center justify-center rounded-sm px-0.5 text-center text-xs font-semibold leading-tight ${
              tab === id ? "bg-raised text-ink shadow-card" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1 px-5 py-5">
        {tab === "hoy" && <HoyTab board={board} onRefresh={onRefresh} />}
        {tab === "deudas" && <DebtsTab board={board} onRefresh={onRefresh} />}
        {tab === "historial" && <HistoryTab board={board} />}
        {tab === "config" && <ConfigTab board={board} onRefresh={onRefresh} />}
      </div>
    </div>
  );
}

function HoyTab({ board, onRefresh }: { board: AdminBoard; onRefresh: () => void }) {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <PublishCard board={board} onRefresh={onRefresh} />
      {board.day && <MoneyStrip day={board.day} phase={board.phase} />}
      {board.day && <ReservationList board={board} onRefresh={onRefresh} />}
      {board.day && <DayActions onRefresh={onRefresh} />}
    </div>
  );
}

function PublishCard({ board, onRefresh }: { board: AdminBoard; onRefresh: () => void }) {
  const day = board.day;
  const defaultDate = day?.serviceDate ?? nextServiceDate(readClock());
  const [serviceDate, setServiceDate] = useState(defaultDate);
  const [dishName, setDishName] = useState(day?.dishName ?? DISH_PRESETS[0].name);
  const [photoUrl, setPhotoUrl] = useState<string | null>(day?.photoUrl ?? DISH_PRESETS[0].photo);
  const [notes, setNotes] = useState(day?.notes ?? DISH_PRESETS[0].notes);
  const [capacity, setCapacity] = useState(day?.capacity ?? board.defaultCapacity);
  const [busy, setBusy] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customBusy, setCustomBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const data = await compressImage(file);
      setPhotoUrl(data);
    } catch {
      toast.error("No se pudo leer la foto.");
    }
  }

  async function onCustomFile(file: File | undefined) {
    if (!file) return;
    try {
      setCustomPhoto(await compressImage(file));
    } catch {
      toast.error("No se pudo leer la foto.");
    }
  }

  function pickDish(name: string, photo: string | null, notes: string) {
    setDishName(name);
    setPhotoUrl(photo);
    setNotes(notes);
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl text-ink">Publicar el día</h2>
        <p className="text-sm text-muted">
          Elige platillo, foto y notas. Se ve en la home al instante.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Fecha de venta</Label>
        <Input
          id="date"
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Platillo rápido</p>
        <div className="grid grid-cols-3 gap-2">
          {DISH_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pickDish(p.name, p.photo, p.notes)}
              className={`overflow-hidden rounded-md border text-left ${
                photoUrl === p.photo ? "border-ink" : "border-line"
              }`}
            >
              <img src={p.photo} alt="" className="h-16 w-full object-cover" />
              <span className="block truncate px-2 py-1 text-xs font-medium text-ink">
                {p.name}
              </span>
            </button>
          ))}
          {board.customDishes.map((p) => (
            <div
              key={p.id}
              className={`relative overflow-hidden rounded-md border ${
                photoUrl === p.photo ? "border-ink" : "border-line"
              }`}
            >
              <button
                type="button"
                className="absolute right-1 top-1 z-10 flex size-8 items-center justify-center rounded-sm bg-raised text-ink"
                aria-label={`Quitar ${p.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void (async () => {
                    try {
                      await deleteCustomDish({ data: { id: p.id } });
                      if (photoUrl === p.photo) setPhotoUrl(null);
                      onRefresh();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "No se pudo borrar.");
                    }
                  })();
                }}
              >
                <X className="size-4" />
              </button>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => pickDish(p.name, p.photo, p.notes)}
              >
                {p.photo ? (
                  <img src={p.photo} alt="" className="h-16 w-full object-cover" />
                ) : (
                  <div className="flex h-16 items-center justify-center bg-line text-xs text-muted">
                    Sin foto
                  </div>
                )}
                <span className="block truncate px-2 py-1 text-xs font-medium text-ink">
                  {p.name}
                </span>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAddingCustom(true)}
            className="flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink/30 bg-raised px-2 text-ink"
          >
            <Plus className="size-5" />
            <span className="text-xs font-semibold">Otro platillo</span>
          </button>
        </div>
      </div>

      {addingCustom && (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4">
          <p className="text-sm font-semibold text-ink">Nuevo platillo</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-name">Nombre</Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ej. Arroz frito"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-notes">Notas</Label>
            <textarea
              id="custom-notes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-line bg-bg px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-chili/25"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-photo">Foto</Label>
            <input
              id="custom-photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="h-12 w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-line file:px-3 file:text-sm file:font-medium file:text-ink"
              onChange={(e) => void onCustomFile(e.target.files?.[0])}
            />
          </div>
          {customPhoto && (
            <img src={customPhoto} alt="" className="h-28 w-full rounded-md object-cover" />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={customBusy}
              onClick={() => {
                setAddingCustom(false);
                setCustomName("");
                setCustomNotes("");
                setCustomPhoto(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={customBusy}
              onClick={async () => {
                setCustomBusy(true);
                try {
                  await saveCustomDish({
                    data: {
                      name: customName,
                      photoUrl: customPhoto,
                      notes: customNotes,
                    },
                  });
                  pickDish(customName.trim(), customPhoto, customNotes);
                  setAddingCustom(false);
                  setCustomName("");
                  setCustomNotes("");
                  setCustomPhoto(null);
                  toast.success("Platillo guardado.");
                  onRefresh();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
                } finally {
                  setCustomBusy(false);
                }
              }}
            >
              {customBusy ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="dish">Nombre</Label>
        <Input id="dish" value={dishName} onChange={(e) => setDishName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-line bg-raised px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-chili/25"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cap">Capacidad</Label>
          <Input
            id="cap"
            type="number"
            min={1}
            max={40}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="photo">Foto (celular)</Label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            capture="environment"
            className="h-12 w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-line file:px-3 file:text-sm file:font-medium file:text-ink"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {photoUrl && (
        <img src={photoUrl} alt="" className="h-40 w-full rounded-lg object-cover" />
      )}

      <Button
        size="lg"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await publishDay({
              data: {
                serviceDate,
                dishName,
                photoUrl,
                notes,
                capacity,
              },
            });
            toast.success("Publicado. Ya se ve en la home.");
            onRefresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo publicar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Publicando…" : day ? "Actualizar platillo" : "Publicar platillo"}
      </Button>
    </section>
  );
}

function MoneyStrip({
  day,
  phase,
}: {
  day: NonNullable<AdminBoard["day"]>;
  phase: AdminBoard["phase"];
}) {
  const t = day.totals;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">Dinero</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {phase === "leftover" ? "Sobrantes" : phase === "early" ? "Anticipadas" : phase}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Cobrado" value={formatMoney(t.collectedCents)} />
        <Stat label="Pendiente" value={formatMoney(t.pendingCents)} />
        <Stat label="Deudas" value={formatMoney(t.debtCents)} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {day.reserved} reservados · {day.remaining} libres · {t.platesDelivered} entregados
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-raised px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums text-ink">{value}</p>
    </div>
  );
}

function ReservationList({
  board,
  onRefresh,
}: {
  board: AdminBoard;
  onRefresh: () => void;
}) {
  const rows = board.day?.reservations ?? [];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl text-ink">Reservas</h2>
      {rows.length === 0 && <p className="text-sm text-muted">Nadie ha reservado todavía.</p>}
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <ReservationCard key={row.id} row={row} onRefresh={onRefresh} />
        ))}
      </ul>
    </section>
  );
}

function ReservationCard({
  row,
  onRefresh,
}: {
  row: AdminReservation;
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function patch(partial: {
    paymentStatus?: PaymentStatus;
    deliveryStatus?: DeliveryStatus;
  }) {
    setBusy(true);
    try {
      await updateReservation({ data: { id: row.id, ...partial } });
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setBusy(false);
    }
  }

  const payLabel: Record<PaymentStatus, string> = {
    pending: "Pendiente",
    cash: "Efectivo",
    online: "En línea",
    debt: "Deuda",
  };
  const delLabel: Record<DeliveryStatus, string> = {
    reserved: "Reservado",
    delivered: "Entregado",
    noshow: "No se presentó",
    cancelled: "Cancelado",
  };

  return (
    <li className="rounded-lg border border-line bg-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">{row.name}</p>
          <p className="text-sm tabular-nums text-muted">{row.phoneDisplay}</p>
        </div>
        <p className="font-display text-xl tabular-nums text-ink">{row.quantity}</p>
      </div>
      <p className="mt-1 text-xs text-muted">
        {row.timeLabel}
        {row.deliveryStatus === "noshow"
          ? " · No se presentó"
          : ` · ${payLabel[row.paymentStatus]} · ${delLabel[row.deliveryStatus]}`}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="leaf"
          disabled={busy}
          onClick={() => void patch({ deliveryStatus: "delivered" })}
        >
          Ya llegué
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void patch({ paymentStatus: "cash" })}
        >
          Cash
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void patch({ paymentStatus: "online" })}
        >
          Pago en línea
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void patch({ paymentStatus: "debt" })}
        >
          Deuda
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="col-span-2"
          disabled={busy}
          onClick={() => void patch({ deliveryStatus: "noshow" })}
        >
          No se presentó
        </Button>
      </div>
    </li>
  );
}

function DayActions({ onRefresh }: { onRefresh: () => void }) {
  const [message, setMessage] = useState("Hoy no voy. Tu reserva queda cancelada.");
  const [busy, setBusy] = useState(false);

  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6">
      <h2 className="font-display text-2xl text-ink">Cerrar o cancelar</h2>
      <Label htmlFor="cancel-msg">Aviso si cancelas</Label>
      <textarea
        id="cancel-msg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-line bg-raised px-4 py-3 text-base text-ink outline-none"
      />
      <Button
        variant="danger"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm("¿Cancelar el día y avisar en la home?")) return;
          setBusy(true);
          try {
            const result = await cancelDay({ data: { message } });
            toast.success(
              `Día cancelado. Aviso visible. SMS a ${result.wouldNotify} personas queda pendiente de Twilio.`,
            );
            onRefresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo cancelar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Hoy no voy
      </Button>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await closeDay();
            toast.success("Día cerrado. Resumen guardado en historial.");
            onRefresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo cerrar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Cerrar el día
      </Button>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const data = await reminderPreview();
            toast.message(data.message || "Nadie para recordar", {
              description:
                data.recipients.length === 0
                  ? "Sin reservas activas."
                  : `${data.recipients.length} SMS de demo (Twilio pendiente): ${data.recipients.map((r) => r.name).join(", ")}`,
            });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo armar el aviso.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Probar recordatorio de mañana
      </Button>
    </section>
  );
}

function DebtsTab({ board, onRefresh }: { board: AdminBoard; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const debts = board.debts ?? [];
  const totals = board.day?.totals;
  const debtCents = totals?.debtCents ?? debts.reduce((n, d) => n + d.amountCents, 0);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      onRefresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-5 pb-16">
      <div>
        <h2 className="font-display text-2xl text-ink">Deudas</h2>
        <p className="text-sm text-muted">
          {formatMoney(debtCents)} abiertas. +10 y −10 mueven un plato.
        </p>
      </div>

      {board.day && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Cobrado" value={formatMoney(board.day.totals.collectedCents)} />
          <Stat label="Pendiente" value={formatMoney(board.day.totals.pendingCents)} />
          <Stat label="Deudas" value={formatMoney(board.day.totals.debtCents)} />
        </div>
      )}

      {debts.length === 0 && (
        <p className="text-sm text-muted">Nadie debe nada. Márcalo en una reserva o agrégalo abajo.</p>
      )}

      <ul className="flex flex-col gap-3">
        {debts.map((row) => (
          <DebtCard key={row.id} row={row} busy={busy} run={run} />
        ))}
      </ul>

      <form
        className="flex flex-col gap-3 border-t border-line pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () => addDebt({ data: { name, phone, quantity } }),
            "Deuda agregada.",
          ).then((ok) => {
            if (!ok) return;
            setName("");
            setPhone("");
            setQuantity(1);
          });
        }}
      >
        <h3 className="font-display text-xl text-ink">Agregar a mano</h3>
        <div className="flex flex-col gap-2">
          <Label htmlFor="debt-name">Nombre</Label>
          <Input
            id="debt-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="debt-phone">Teléfono</Label>
          <Input
            id="debt-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="debt-qty">Platos a $10</Label>
          <Input
            id="debt-qty"
            type="number"
            min={1}
            max={40}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Guardando…" : `Agregar ${formatMoney(quantity * board.priceCents)}`}
        </Button>
      </form>
    </section>
  );
}

function DebtCard({
  row,
  busy,
  run,
}: {
  row: DebtItem;
  busy: boolean;
  run: (fn: () => Promise<unknown>, ok: string) => Promise<boolean>;
}) {
  return (
    <li className="rounded-lg border border-line bg-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">{row.name}</p>
          <p className="text-sm tabular-nums text-muted">{row.phoneDisplay}</p>
          <p className="mt-1 text-xs capitalize text-muted">{row.dateLabel}</p>
        </div>
        <p className="font-display text-xl tabular-nums text-ink">
          {formatMoney(row.amountCents)}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void run(() => adjustDebt({ data: { id: row.id, deltaPlates: 1 } }), "Sumó $10.")}
        >
          +10
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || row.amountCents < 1000}
          onClick={() => void run(() => adjustDebt({ data: { id: row.id, deltaPlates: -1 } }), "Restó $10.")}
        >
          −10
        </Button>
        <Button
          size="sm"
          variant="leaf"
          disabled={busy}
          onClick={() => void run(() => payDebt({ data: { id: row.id } }), "Marcada como pagada.")}
        >
          Ya pagó
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => void run(() => removeDebt({ data: { id: row.id } }), "Deuda quitada.")}
        >
          Quitar deuda
        </Button>
      </div>
    </li>
  );
}

function HistoryTab({ board }: { board: AdminBoard }) {
  return (
    <section className="flex flex-col gap-3 pb-16">
      <h2 className="font-display text-2xl text-ink">Días anteriores</h2>
      {board.history.length === 0 && <p className="text-sm text-muted">Todavía no hay historial.</p>}
      <ul className="flex flex-col">
        {board.history.map((h) => (
          <li
            key={h.id}
            className="flex items-baseline justify-between gap-3 border-b border-line py-3"
          >
            <div>
              <p className="font-medium capitalize text-ink">
                {h.weekdayLabel} · {h.dishName}
              </p>
              <p className="text-xs text-muted">
                {h.sold} vendidos · {h.leftover} sobraron
                {h.status === "cancelled" ? " · cancelado" : ""}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-ink">
              {formatMoney(h.collectedCents)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConfigTab({ board, onRefresh }: { board: AdminBoard; onRefresh: () => void }) {
  const [maxPerPerson, setMaxPerPerson] = useState(board.maxPerPerson === 2 ? 2 : 3);
  const [capacity, setCapacity] = useState(board.defaultCapacity);
  const [phaseOverride, setPhaseOverride] = useState<"early" | "leftover" | null>(
    board.phaseOverride,
  );
  const [busy, setBusy] = useState(false);

  return (
    <section className="flex flex-col gap-5 pb-16">
      <h2 className="font-display text-2xl text-ink">Reglas</h2>
      <p className="text-sm text-muted">
        Precio fijo {formatMoney(board.priceCents)}. Reloj del servidor: {board.now.ymd}{" "}
        {String(board.now.hour).padStart(2, "0")}:{String(board.now.minute).padStart(2, "0")}{" "}
        {board.now.tz}.
      </p>

      <fieldset>
        <Label>Tope por persona</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxPerPerson(n as 2 | 3)}
              className={`h-12 rounded-md border font-semibold ${
                maxPerPerson === n ? "border-ink bg-ink text-raised" : "border-line bg-raised"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="def-cap">Capacidad por defecto</Label>
        <Input
          id="def-cap"
          type="number"
          min={1}
          max={40}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
      </div>

      <fieldset>
        <Label>Fase (demo)</Label>
        <p className="mb-2 text-xs text-muted">
          El corte real es a las 8:00 AM hora de Chicago. Esto solo simula la vista.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              [null, "Reloj"],
              ["early", "Antes 8AM"],
              ["leftover", "Sobrantes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setPhaseOverride(value)}
              className={`h-12 rounded-md border text-sm font-semibold ${
                phaseOverride === value ? "border-ink bg-ink text-raised" : "border-line bg-raised"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <Button
        size="lg"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await saveConfig({
              data: { maxPerPerson, capacity, phaseOverride },
            });
            toast.success("Configuración guardada.");
            onRefresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Guardar
      </Button>

      <div className="rounded-lg border border-line bg-raised p-4 text-sm text-muted">
        <p className="font-semibold text-ink">Pendiente para producción</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Twilio: código SMS, recordatorio de la mañana y aviso de “hoy no voy”.</li>
          <li>Stripe: cobro en línea de $10. Hoy solo se marca el estado.</li>
          <li>2FA al celular del vendedor.</li>
        </ul>
      </div>
    </section>
  );
}
