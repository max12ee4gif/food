import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getPublicBoard = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicBoardData } = await import("./board.server");
  return getPublicBoardData();
});

export const startReserve = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(80),
      phone: z.string().min(7).max(20),
      quantity: z.number().int().min(1).max(3),
      paymentMethod: z.enum(["cash", "online"]),
    }),
  )
  .handler(async ({ data }) => {
    const { startReserveData } = await import("./board.server");
    return startReserveData(data);
  });

export const confirmReserve = createServerFn({ method: "POST" })
  .validator(
    z.object({
      challengeId: z.number().int(),
      code: z.string().min(4).max(8),
    }),
  )
  .handler(async ({ data }) => {
    const { confirmReserveData } = await import("./board.server");
    return confirmReserveData(data);
  });

export const getAdminBoard = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminBoardData } = await import("./board.server");
  return getAdminBoardData();
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(1).max(40),
      password: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const { loginAdminData } = await import("./board.server");
    return loginAdminData(data);
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutAdminData } = await import("./board.server");
  return logoutAdminData();
});

export const publishDay = createServerFn({ method: "POST" })
  .validator(
    z.object({
      serviceDate: z.string().min(8).max(12),
      dishName: z.string().min(1).max(80),
      photoUrl: z.string().max(400000).nullable(),
      notes: z.string().max(280),
      capacity: z.number().int().min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const { publishDayData } = await import("./board.server");
    return publishDayData(data);
  });

export const cancelDay = createServerFn({ method: "POST" })
  .validator(z.object({ message: z.string().max(280) }))
  .handler(async ({ data }) => {
    const { cancelDayData } = await import("./board.server");
    return cancelDayData(data);
  });

export const closeDay = createServerFn({ method: "POST" }).handler(async () => {
  const { closeDayData } = await import("./board.server");
  return closeDayData();
});

export const updateReservation = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      paymentStatus: z.enum(["pending", "cash", "online", "debt"]).optional(),
      deliveryStatus: z.enum(["reserved", "delivered", "noshow", "cancelled"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { updateReservationData } = await import("./board.server");
    return updateReservationData(data);
  });

export const saveConfig = createServerFn({ method: "POST" })
  .validator(
    z.object({
      maxPerPerson: z.number().int(),
      capacity: z.number().int(),
      phaseOverride: z.enum(["early", "leftover"]).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const { saveConfigData } = await import("./board.server");
    return saveConfigData(data);
  });

export const reminderPreview = createServerFn({ method: "POST" }).handler(async () => {
  const { reminderPreviewData } = await import("./board.server");
  return reminderPreviewData();
});

export const addDebt = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(80),
      phone: z.string().min(7).max(20),
      quantity: z.number().int().min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const { addDebtData } = await import("./board.server");
    return addDebtData(data);
  });

export const adjustDebt = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      deltaPlates: z.number().int(),
    }),
  )
  .handler(async ({ data }) => {
    const { adjustDebtData } = await import("./board.server");
    return adjustDebtData(data);
  });

export const payDebt = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const { payDebtData } = await import("./board.server");
    return payDebtData(data);
  });

export const removeDebt = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const { removeDebtData } = await import("./board.server");
    return removeDebtData(data);
  });

export const saveCustomDish = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(80),
      photoUrl: z.string().max(400000).nullable(),
      notes: z.string().max(280),
    }),
  )
  .handler(async ({ data }) => {
    const { saveCustomDishData } = await import("./board.server");
    return saveCustomDishData(data);
  });

export const deleteCustomDish = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const { deleteCustomDishData } = await import("./board.server");
    return deleteCustomDishData(data);
  });

