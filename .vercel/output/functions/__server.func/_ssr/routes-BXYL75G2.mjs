import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { a as ArrowLeft, i as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as startReserve, c as confirmReserve, d as getPublicBoard, r as Route$1 } from "./router-y0Zfp3Lw.mjs";
import { i as formatMoney, n as Input, r as Label, t as Button } from "./label-m5Eb5csY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BXYL75G2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReserveFlow({ board, onClose, onDone }) {
	const day = board.day;
	const [step, setStep] = (0, import_react.useState)("form");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("cash");
	const [code, setCode] = (0, import_react.useState)("");
	const [challengeId, setChallengeId] = (0, import_react.useState)(null);
	const [demoCode, setDemoCode] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [confirmedQty, setConfirmedQty] = (0, import_react.useState)(1);
	if (!day) return null;
	const maxQty = Math.min(board.maxPerPerson, Math.max(1, day.remaining));
	async function sendCode() {
		setBusy(true);
		try {
			const result = await startReserve({ data: {
				name,
				phone,
				quantity,
				paymentMethod
			} });
			setChallengeId(result.challengeId);
			setDemoCode(result.demoCode);
			setStep("code");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "No se pudo enviar el código.");
		} finally {
			setBusy(false);
		}
	}
	async function confirm() {
		if (challengeId == null) return;
		setBusy(true);
		try {
			const result = await confirmReserve({ data: {
				challengeId,
				code
			} });
			setConfirmedQty(result.quantity);
			setStep("done");
			onDone();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "No se pudo confirmar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex justify-center bg-ink/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full max-w-md flex-col bg-bg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: step === "done" ? onClose : onClose,
					className: "flex size-11 items-center justify-center rounded-md text-ink hover:bg-line/70",
					"aria-label": "Cerrar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-muted",
					children: step === "done" ? "Listo" : "Reservar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-tight text-ink",
					children: day.dishName
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto px-5 pb-8",
				children: [
					step === "form" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-5",
						onSubmit: (e) => {
							e.preventDefault();
							sendCode();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									formatMoney(day.priceCents),
									" por plato · máximo ",
									board.maxPerPerson,
									" por número"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "Tu nombre"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									autoComplete: "name",
									autoCapitalize: "words",
									placeholder: "Nombre y apellido",
									value: name,
									onChange: (e) => setName(e.target.value),
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "phone",
										children: "Celular"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "phone",
										type: "tel",
										inputMode: "tel",
										autoComplete: "tel",
										placeholder: "(210) 555-0142",
										value: phone,
										onChange: (e) => setPhone(e.target.value),
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Te mandamos un código. El número queda para recordatorios y si no llegas."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cuántos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setQuantity(n),
										className: `h-12 flex-1 rounded-md border text-base font-semibold tabular-nums transition-colors ${quantity === n ? "border-ink bg-ink text-raised" : "border-line bg-raised text-ink"}`,
										children: n
									}, n))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								className: "flex flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cómo piensas pagar" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setPaymentMethod("cash"),
											className: `h-12 rounded-md border text-sm font-semibold ${paymentMethod === "cash" ? "border-ink bg-ink text-raised" : "border-line bg-raised text-ink"}`,
											children: "Efectivo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setPaymentMethod("online"),
											className: `h-12 rounded-md border text-sm font-semibold ${paymentMethod === "online" ? "border-ink bg-ink text-raised" : "border-line bg-raised text-ink"}`,
											children: "En línea"
										})]
									}),
									paymentMethod === "online" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "El pago en línea se marca en caja. Stripe queda pendiente de conectar."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "lg",
								className: "mt-2 w-full",
								disabled: busy,
								children: busy ? "Enviando…" : "Enviar código"
							})
						]
					}),
					step === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-5",
						onSubmit: (e) => {
							e.preventDefault();
							confirm();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-base text-ink",
								children: [
									"Escribe el código que te mandamos al ",
									phone,
									"."
								]
							}),
							demoCode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-warn/30 bg-warn-soft px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium uppercase tracking-wide text-warn",
										children: "Modo demo · SMS sin Twilio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-3xl tabular-nums tracking-[0.3em] text-ink",
										children: demoCode
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Cuando conectes Twilio, el código llega de verdad al celular."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "code",
									children: "Código"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "code",
									inputMode: "numeric",
									autoComplete: "one-time-code",
									pattern: "[0-9]*",
									maxLength: 6,
									placeholder: "000000",
									className: "text-center font-display text-2xl tracking-[0.4em] tabular-nums",
									value: code,
									onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "lg",
								className: "w-full",
								disabled: busy || code.length < 4,
								children: busy ? "Confirmando…" : "Confirmar reserva"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm text-muted underline-offset-2 hover:underline",
								onClick: () => {
									setStep("form");
									setCode("");
								},
								children: "Usar otro número"
							})
						]
					}),
					step === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-4 pt-10 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-16 items-center justify-center rounded-full bg-leaf-soft text-leaf",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "size-8",
									strokeWidth: 2.4
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl text-ink",
								children: "Te lo guardo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "max-w-xs text-base text-muted",
								children: [
									confirmedQty === 1 ? "1 plato" : `${confirmedQty} platos`,
									" de ",
									day.dishName,
									". Trae ",
									paymentMethod === "cash" ? "efectivo" : "el pago listo",
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								className: "mt-4 w-full",
								onClick: onClose,
								children: "Listo"
							})
						]
					})
				]
			})]
		})
	});
}
function phaseCopy(board) {
	const day = board.day;
	if (!day || board.phase === "empty") return {
		kicker: "Sin platillo",
		detail: "Aún no publican el de hoy. Vuelve más tarde."
	};
	if (board.phase === "cancelled") return {
		kicker: "Hoy no voy",
		detail: day.cancelMessage || "El vendedor canceló el día."
	};
	if (day.remaining <= 0) return {
		kicker: "Agotado",
		detail: "Se acabaron. Mañana hay otro."
	};
	if (board.phase === "ended") return {
		kicker: "Ya cerró",
		detail: "El servicio de hoy terminó."
	};
	if (board.phase === "leftover") return {
		kicker: "Platos libres",
		detail: `Quedan ${day.remaining} platos libres de ${day.dishName}.`
	};
	const sameDay = day.serviceDate === board.now.ymd;
	return {
		kicker: sameDay ? "Reserva abierta" : `Reserva para el ${day.weekdayLabel}`,
		detail: sameDay ? "Hasta las 8:00 AM te lo guardo. Después, lo que sobre." : `Hasta las 8:00 AM del ${day.weekdayLabel} te lo guardo.`
	};
}
function statusTone(phase, remaining) {
	if (phase === "cancelled" || remaining <= 0 || phase === "ended" || phase === "empty") return "bg-sold text-raised";
	if (remaining <= 3) return "bg-chili text-raised";
	return "bg-leaf text-raised";
}
function PublicBoardView({ initial }) {
	const [reserveOpen, setReserveOpen] = (0, import_react.useState)(false);
	const query = useQuery({
		queryKey: ["public-board"],
		queryFn: () => getPublicBoard(),
		initialData: initial,
		refetchInterval: 4e3
	});
	const board = query.data;
	if (query.isLoading && !board) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-dvh w-full max-w-md bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[42vh] min-h-[240px] animate-pulse rounded-b-xl bg-line" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-32 animate-pulse rounded-full bg-line" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-12 w-3/4 animate-pulse rounded-md bg-line" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-6 w-20 animate-pulse rounded-md bg-line" })
			]
		})]
	});
	const day = board?.day ?? null;
	const remaining = day?.remaining ?? 0;
	const soldOut = !day || remaining <= 0 || board?.phase === "cancelled" || board?.phase === "ended" || board?.phase === "empty";
	const copy = board ? phaseCopy(board) : {
		kicker: "Cargando",
		detail: "Buscando el platillo de hoy."
	};
	const canReserve = Boolean(board && day && !soldOut);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-dvh w-full max-w-md bg-bg shadow-card",
		children: [
			day?.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-[42vh] min-h-[240px] overflow-hidden rounded-b-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: day.photoUrl,
					alt: day.dishName,
					className: "size-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-[32vh] min-h-[200px] items-end rounded-b-xl bg-line px-6 pb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl text-ink",
					children: "Hoy Hay"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pb-12 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold uppercase tracking-wide ${statusTone(board?.phase ?? "empty", remaining)}`,
							children: copy.kicker
						}), board?.lastPlates && !soldOut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold text-chili",
							children: "Últimos platos"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-[2.4rem] leading-[1.05] text-ink",
						children: day?.dishName ?? "Nada publicado"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xl font-semibold tabular-nums text-ink",
						children: day ? formatMoney(day.priceCents) : ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-base text-muted",
						children: copy.detail
					}),
					day && board?.phase !== "empty" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-lg bg-raised px-4 py-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-muted",
							children: remaining <= 0 ? "Agotado" : board?.phase === "leftover" ? "Libres ahora" : "Quedan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `mt-1 font-display text-5xl leading-none tabular-nums ${remaining <= 0 ? "text-sold" : remaining <= 3 ? "text-chili" : "text-leaf"}`,
							children: [remaining, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-2xl text-muted",
								children: [" de ", day.capacity]
							})]
						})]
					}),
					day?.notes && board?.phase !== "cancelled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: day.notes
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canReserve,
						onClick: () => setReserveOpen(true),
						className: `mt-6 flex h-14 w-full items-center justify-center rounded-md text-lg font-semibold transition-[transform,background-color] duration-150 active:scale-[0.98] ${canReserve ? "bg-chili text-raised hover:bg-chili-press" : "bg-sold text-raised"}`,
						children: soldOut ? remaining <= 0 && day && board?.phase !== "cancelled" ? "Agotado" : board?.phase === "cancelled" ? "Hoy no voy" : "Cerrado" : "Reservar"
					}),
					board?.history && board.history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted",
							children: "Los otros días"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-2",
							children: board.history.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-ink",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "capitalize text-muted",
											children: item.weekdayLabel
										}),
										" · ",
										item.dishName
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs tabular-nums text-muted",
									children: [item.sold, " vendidos"]
								})]
							}, item.serviceDate))
						})]
					})
				]
			}),
			reserveOpen && board && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReserveFlow, {
				board,
				onClose: () => setReserveOpen(false),
				onDone: () => {
					query.refetch();
				}
			})
		]
	});
}
function Home() {
	const initial = Route$1.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicBoardView, { initial });
}
//#endregion
export { Home as component };
