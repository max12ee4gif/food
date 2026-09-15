export const TIMEZONE = "America/Chicago";
export const PRICE_CENTS = 1000;
export const DEFAULT_CAPACITY = 10;
export const DEFAULT_MAX_PER_PERSON = 3;
export const LAST_PLATES_THRESHOLD = 3;

export type Phase = "early" | "leftover" | "ended" | "cancelled" | "empty";
export type PaymentMethod = "cash" | "online";
export type PaymentStatus = "pending" | "cash" | "online" | "debt";
export type DeliveryStatus = "reserved" | "delivered" | "noshow" | "cancelled";
export type DayStatus = "open" | "closed" | "cancelled";

export type PublicDay = {
  id: number;
  serviceDate: string;
  weekdayLabel: string;
  dateLabel: string;
  dishName: string;
  photoUrl: string | null;
  notes: string | null;
  capacity: number;
  remaining: number;
  reserved: number;
  priceCents: number;
  status: DayStatus;
  cancelMessage: string | null;
};

export type HistoryItem = {
  serviceDate: string;
  weekdayLabel: string;
  dishName: string;
  sold: number;
  leftover: number;
};

export type PublicBoard = {
  now: {
    ymd: string;
    hour: number;
    minute: number;
    weekday: number;
    tz: string;
  };
  phase: Phase;
  day: PublicDay | null;
  lastPlates: boolean;
  maxPerPerson: number;
  history: HistoryItem[];
  smsMode: "demo" | "live";
};

export type AdminReservation = {
  id: number;
  name: string;
  phone: string;
  phoneDisplay: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  timeLabel: string;
};

export type MoneyTotals = {
  platesReserved: number;
  platesDelivered: number;
  platesNoshow: number;
  capacity: number;
  collectedCents: number;
  pendingCents: number;
  debtCents: number;
  potentialCents: number;
};

export type AdminDay = {
  id: number;
  serviceDate: string;
  weekdayLabel: string;
  dateLabel: string;
  dishName: string;
  photoUrl: string | null;
  notes: string | null;
  capacity: number;
  priceCents: number;
  status: DayStatus;
  cancelMessage: string | null;
  remaining: number;
  reserved: number;
  reservations: AdminReservation[];
  totals: MoneyTotals;
};

export type AdminBoard = {
  authenticated: boolean;
  now: PublicBoard["now"];
  phase: Phase;
  phaseOverride: "early" | "leftover" | null;
  maxPerPerson: number;
  defaultCapacity: number;
  priceCents: number;
  smsEnabled: boolean;
  day: AdminDay | null;
  upcoming: Array<{
    id: number;
    serviceDate: string;
    dishName: string;
    status: DayStatus;
    remaining: number;
    capacity: number;
  }>;
  history: Array<
    HistoryItem & {
      id: number;
      collectedCents: number;
      status: DayStatus;
    }
  >;
  debts: DebtItem[];
  customDishes: CustomDish[];
};

export type DebtStatus = "open" | "paid" | "removed";

export type DebtItem = {
  id: number;
  reservationId: number | null;
  name: string;
  phone: string;
  phoneDisplay: string;
  amountCents: number;
  serviceDate: string;
  dateLabel: string;
  status: DebtStatus;
};

export type CustomDish = {
  id: number;
  name: string;
  photo: string | null;
  notes: string;
};

export type DishPreset = {
  id: string;
  name: string;
  photo: string;
  notes: string;
};
