import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-C2IJ0A8N.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getPublicBoard_createServerFn_handler = createServerRpc({
	id: "ecd3b738553f40a91a209225d2be6ad3306d1aa4aa1ce361077e1c54504c7586",
	name: "getPublicBoard",
	filename: "src/lib/lunch/api.ts"
}, (opts) => getPublicBoard.__executeServer(opts));
var getPublicBoard = createServerFn({ method: "GET" }).handler(getPublicBoard_createServerFn_handler, async () => {
	const { getPublicBoardData } = await import("./board.server-C2Gnz8_q.mjs");
	return getPublicBoardData();
});
var startReserve_createServerFn_handler = createServerRpc({
	id: "2e6e1a3618440a4e14468fd475962bbd6682bf55e3797c96e9e35f7e9c0fac67",
	name: "startReserve",
	filename: "src/lib/lunch/api.ts"
}, (opts) => startReserve.__executeServer(opts));
var startReserve = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1).max(80),
	phone: string().min(7).max(20),
	quantity: number().int().min(1).max(3),
	paymentMethod: _enum(["cash", "online"])
})).handler(startReserve_createServerFn_handler, async ({ data }) => {
	const { startReserveData } = await import("./board.server-C2Gnz8_q.mjs");
	return startReserveData(data);
});
var confirmReserve_createServerFn_handler = createServerRpc({
	id: "0c98e46d033918ca13aab86a5acf3ec2e974e99ca620e3dab571a5fd05cf5ba0",
	name: "confirmReserve",
	filename: "src/lib/lunch/api.ts"
}, (opts) => confirmReserve.__executeServer(opts));
var confirmReserve = createServerFn({ method: "POST" }).validator(object({
	challengeId: number().int(),
	code: string().min(4).max(8)
})).handler(confirmReserve_createServerFn_handler, async ({ data }) => {
	const { confirmReserveData } = await import("./board.server-C2Gnz8_q.mjs");
	return confirmReserveData(data);
});
var getAdminBoard_createServerFn_handler = createServerRpc({
	id: "cc4c5bd1f139af15e87921f0378e0fa6053be00dab3c27558c1ace49b858d81a",
	name: "getAdminBoard",
	filename: "src/lib/lunch/api.ts"
}, (opts) => getAdminBoard.__executeServer(opts));
var getAdminBoard = createServerFn({ method: "GET" }).handler(getAdminBoard_createServerFn_handler, async () => {
	const { getAdminBoardData } = await import("./board.server-C2Gnz8_q.mjs");
	return getAdminBoardData();
});
var loginAdmin_createServerFn_handler = createServerRpc({
	id: "8f8e83a4821dd6c2d2b067b32737b4f248a3aec94bf3345d35aa97b8eaed2ddb",
	name: "loginAdmin",
	filename: "src/lib/lunch/api.ts"
}, (opts) => loginAdmin.__executeServer(opts));
var loginAdmin = createServerFn({ method: "POST" }).validator(object({
	username: string().min(1).max(40),
	password: string().min(1).max(80)
})).handler(loginAdmin_createServerFn_handler, async ({ data }) => {
	const { loginAdminData } = await import("./board.server-C2Gnz8_q.mjs");
	return loginAdminData(data);
});
var logoutAdmin_createServerFn_handler = createServerRpc({
	id: "7bbf1bcde691599deb8158aaa02dce7338d75812bf223c259f8bf2ed084c8669",
	name: "logoutAdmin",
	filename: "src/lib/lunch/api.ts"
}, (opts) => logoutAdmin.__executeServer(opts));
var logoutAdmin = createServerFn({ method: "POST" }).handler(logoutAdmin_createServerFn_handler, async () => {
	const { logoutAdminData } = await import("./board.server-C2Gnz8_q.mjs");
	return logoutAdminData();
});
var publishDay_createServerFn_handler = createServerRpc({
	id: "2a7199780e01f14daf209034faf4ef042007a59857a21c12b90dd9ae709b9086",
	name: "publishDay",
	filename: "src/lib/lunch/api.ts"
}, (opts) => publishDay.__executeServer(opts));
var publishDay = createServerFn({ method: "POST" }).validator(object({
	serviceDate: string().min(8).max(12),
	dishName: string().min(1).max(80),
	photoUrl: string().max(4e5).nullable(),
	notes: string().max(280),
	capacity: number().int().min(1).max(40)
})).handler(publishDay_createServerFn_handler, async ({ data }) => {
	const { publishDayData } = await import("./board.server-C2Gnz8_q.mjs");
	return publishDayData(data);
});
var cancelDay_createServerFn_handler = createServerRpc({
	id: "9d5ca7d8dc03b3fe5e849a0278f3f9d3e9e236e8b357c854ca44623aadd97314",
	name: "cancelDay",
	filename: "src/lib/lunch/api.ts"
}, (opts) => cancelDay.__executeServer(opts));
var cancelDay = createServerFn({ method: "POST" }).validator(object({ message: string().max(280) })).handler(cancelDay_createServerFn_handler, async ({ data }) => {
	const { cancelDayData } = await import("./board.server-C2Gnz8_q.mjs");
	return cancelDayData(data);
});
var closeDay_createServerFn_handler = createServerRpc({
	id: "46f96f318b4a1ac69ca8ca3c70ba35186291264309be919ce76a2c5e5e0d2f9e",
	name: "closeDay",
	filename: "src/lib/lunch/api.ts"
}, (opts) => closeDay.__executeServer(opts));
var closeDay = createServerFn({ method: "POST" }).handler(closeDay_createServerFn_handler, async () => {
	const { closeDayData } = await import("./board.server-C2Gnz8_q.mjs");
	return closeDayData();
});
var updateReservation_createServerFn_handler = createServerRpc({
	id: "79f2040a52784bd3e87dc83c2a8b2d0c43f4b91795b3cbbbc497755b8ce94dd7",
	name: "updateReservation",
	filename: "src/lib/lunch/api.ts"
}, (opts) => updateReservation.__executeServer(opts));
var updateReservation = createServerFn({ method: "POST" }).validator(object({
	id: number().int(),
	paymentStatus: _enum([
		"pending",
		"cash",
		"online",
		"debt"
	]).optional(),
	deliveryStatus: _enum([
		"reserved",
		"delivered",
		"noshow",
		"cancelled"
	]).optional()
})).handler(updateReservation_createServerFn_handler, async ({ data }) => {
	const { updateReservationData } = await import("./board.server-C2Gnz8_q.mjs");
	return updateReservationData(data);
});
var saveConfig_createServerFn_handler = createServerRpc({
	id: "01e9ef76f87be3aea11485bdba36497e07e2199b6fa6d5dd6d4bd29e5c81d888",
	name: "saveConfig",
	filename: "src/lib/lunch/api.ts"
}, (opts) => saveConfig.__executeServer(opts));
var saveConfig = createServerFn({ method: "POST" }).validator(object({
	maxPerPerson: number().int(),
	capacity: number().int(),
	phaseOverride: _enum(["early", "leftover"]).nullable()
})).handler(saveConfig_createServerFn_handler, async ({ data }) => {
	const { saveConfigData } = await import("./board.server-C2Gnz8_q.mjs");
	return saveConfigData(data);
});
var reminderPreview_createServerFn_handler = createServerRpc({
	id: "e0807774d926089e71b77332662fdcdb0423f37f233fbba53e041c194e12c451",
	name: "reminderPreview",
	filename: "src/lib/lunch/api.ts"
}, (opts) => reminderPreview.__executeServer(opts));
var reminderPreview = createServerFn({ method: "POST" }).handler(reminderPreview_createServerFn_handler, async () => {
	const { reminderPreviewData } = await import("./board.server-C2Gnz8_q.mjs");
	return reminderPreviewData();
});
var addDebt_createServerFn_handler = createServerRpc({
	id: "c9e5407233240db9644a2ac0e587c32688f8e1592b7883116b4effa17511bfb0",
	name: "addDebt",
	filename: "src/lib/lunch/api.ts"
}, (opts) => addDebt.__executeServer(opts));
var addDebt = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1).max(80),
	phone: string().min(7).max(20),
	quantity: number().int().min(1).max(40)
})).handler(addDebt_createServerFn_handler, async ({ data }) => {
	const { addDebtData } = await import("./board.server-C2Gnz8_q.mjs");
	return addDebtData(data);
});
var adjustDebt_createServerFn_handler = createServerRpc({
	id: "6d1f7c47c36631ae4e21591286dfa69a8e160ea027009fd216a26b0ed1840e30",
	name: "adjustDebt",
	filename: "src/lib/lunch/api.ts"
}, (opts) => adjustDebt.__executeServer(opts));
var adjustDebt = createServerFn({ method: "POST" }).validator(object({
	id: number().int(),
	deltaPlates: number().int()
})).handler(adjustDebt_createServerFn_handler, async ({ data }) => {
	const { adjustDebtData } = await import("./board.server-C2Gnz8_q.mjs");
	return adjustDebtData(data);
});
var payDebt_createServerFn_handler = createServerRpc({
	id: "f5ddf444507cba82b92d62076e8632922592d925c7be1f521bf49e11f77f111b",
	name: "payDebt",
	filename: "src/lib/lunch/api.ts"
}, (opts) => payDebt.__executeServer(opts));
var payDebt = createServerFn({ method: "POST" }).validator(object({ id: number().int() })).handler(payDebt_createServerFn_handler, async ({ data }) => {
	const { payDebtData } = await import("./board.server-C2Gnz8_q.mjs");
	return payDebtData(data);
});
var removeDebt_createServerFn_handler = createServerRpc({
	id: "22c1932a671e43ed8d542aa6b43c35e8ab9d1bc387e943651760fca232260b77",
	name: "removeDebt",
	filename: "src/lib/lunch/api.ts"
}, (opts) => removeDebt.__executeServer(opts));
var removeDebt = createServerFn({ method: "POST" }).validator(object({ id: number().int() })).handler(removeDebt_createServerFn_handler, async ({ data }) => {
	const { removeDebtData } = await import("./board.server-C2Gnz8_q.mjs");
	return removeDebtData(data);
});
var saveCustomDish_createServerFn_handler = createServerRpc({
	id: "ead5414a7e20614c6fbdb47e1f1eb78e6530bd8248eaded00e587f4f19047a67",
	name: "saveCustomDish",
	filename: "src/lib/lunch/api.ts"
}, (opts) => saveCustomDish.__executeServer(opts));
var saveCustomDish = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1).max(80),
	photoUrl: string().max(4e5).nullable(),
	notes: string().max(280)
})).handler(saveCustomDish_createServerFn_handler, async ({ data }) => {
	const { saveCustomDishData } = await import("./board.server-C2Gnz8_q.mjs");
	return saveCustomDishData(data);
});
var deleteCustomDish_createServerFn_handler = createServerRpc({
	id: "e4b8cb43b951b1be4f89cf4fb65449a5abc0df9c5c98008488ae198a3bcc478e",
	name: "deleteCustomDish",
	filename: "src/lib/lunch/api.ts"
}, (opts) => deleteCustomDish.__executeServer(opts));
var deleteCustomDish = createServerFn({ method: "POST" }).validator(object({ id: number().int() })).handler(deleteCustomDish_createServerFn_handler, async ({ data }) => {
	const { deleteCustomDishData } = await import("./board.server-C2Gnz8_q.mjs");
	return deleteCustomDishData(data);
});
//#endregion
export { addDebt_createServerFn_handler, adjustDebt_createServerFn_handler, cancelDay_createServerFn_handler, closeDay_createServerFn_handler, confirmReserve_createServerFn_handler, deleteCustomDish_createServerFn_handler, getAdminBoard_createServerFn_handler, getPublicBoard_createServerFn_handler, loginAdmin_createServerFn_handler, logoutAdmin_createServerFn_handler, payDebt_createServerFn_handler, publishDay_createServerFn_handler, reminderPreview_createServerFn_handler, removeDebt_createServerFn_handler, saveConfig_createServerFn_handler, saveCustomDish_createServerFn_handler, startReserve_createServerFn_handler, updateReservation_createServerFn_handler };
