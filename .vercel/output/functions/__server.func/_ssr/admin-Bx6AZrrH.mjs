import { o as __toESM } from "../_runtime.mjs";
import { c as nextServiceDate, l as readClock, t as DISH_PRESETS } from "./time-D7K8VdEQ.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { r as Plus, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as removeDebt, a as adjustDebt, f as loginAdmin, g as reminderPreview, h as publishDay, i as addDebt, l as deleteCustomDish, m as payDebt, n as Route, o as cancelDay, p as logoutAdmin, s as closeDay, u as getAdminBoard, v as saveConfig, x as updateReservation, y as saveCustomDish } from "./router-y0Zfp3Lw.mjs";
import { i as formatMoney, n as Input, r as Label, t as Button } from "./label-m5Eb5csY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Bx6AZrrH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function compressImage(file, maxEdge = 960, quality = .76) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No se pudo leer la foto.");
	ctx.drawImage(bitmap, 0, 0, width, height);
	let q = quality;
	let data = canvas.toDataURL("image/jpeg", q);
	while (data.length > 28e4 && q > .45) {
		q -= .08;
		data = canvas.toDataURL("image/jpeg", q);
	}
	return data;
}
function AdminPanel({ initial }) {
	const query = useQuery({
		queryKey: ["admin-board"],
		queryFn: () => getAdminBoard(),
		initialData: initial,
		refetchInterval: (q) => q.state.data?.authenticated ? 4e3 : false
	});
	const board = query.data;
	if (!board) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-muted",
		children: "Cargando panel…"
	}) });
	if (!board.authenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, { onOk: () => void query.refetch() }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, {
		board,
		onRefresh: () => void query.refetch()
	}) });
}
function Shell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto min-h-dvh w-full max-w-lg bg-bg shadow-card",
		children
	});
}
function LoginForm({ onOk }) {
	const [username, setUsername] = (0, import_react.useState)("admin");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-4 px-5 pb-10 pt-12",
		onSubmit: async (e) => {
			e.preventDefault();
			setBusy(true);
			try {
				await loginAdmin({ data: {
					username,
					password
				} });
				onOk();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "No se pudo entrar.");
			} finally {
				setBusy(false);
			}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-wide text-muted",
				children: "Panel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl text-ink",
				children: "Hoy Hay"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Solo el vendedor. La home no enlaza aquí."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "user",
					children: "Usuario"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "user",
					autoComplete: "username",
					value: username,
					onChange: (e) => setUsername(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "pass",
					children: "Contraseña"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "pass",
					type: "password",
					autoComplete: "current-password",
					value: password,
					onChange: (e) => setPassword(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "lg",
				disabled: busy,
				children: busy ? "Entrando…" : "Entrar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Demo: admin / plato10. 2FA por SMS queda pendiente."
			})
		]
	});
}
function SignedIn({ board, onRefresh }) {
	const [tab, setTab] = (0, import_react.useState)("hoy");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-end justify-between gap-3 px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-wide text-muted",
					children: "Vendedor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl text-ink",
					children: "Panel"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 text-sm font-medium text-muted",
					onClick: async () => {
						await logoutAdmin();
						onRefresh();
					},
					children: "Salir"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mx-5 grid grid-cols-4 rounded-md bg-line/70 p-1",
				children: [
					["hoy", "Hoy"],
					["deudas", "Deudas"],
					["historial", "Historial"],
					["config", "Config"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: `h-10 rounded-sm text-xs font-semibold ${tab === id ? "bg-raised text-ink shadow-card" : "text-muted"}`,
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 px-5 py-5",
				children: [
					tab === "hoy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoyTab, {
						board,
						onRefresh
					}),
					tab === "deudas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebtsTab, {
						board,
						onRefresh
					}),
					tab === "historial" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTab, { board }),
					tab === "config" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigTab, {
						board,
						onRefresh
					})
				]
			})
		]
	});
}
function HoyTab({ board, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublishCard, {
				board,
				onRefresh
			}),
			board.day && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyStrip, {
				day: board.day,
				phase: board.phase
			}),
			board.day && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReservationList, {
				board,
				onRefresh
			}),
			board.day && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayActions, { onRefresh })
		]
	});
}
function PublishCard({ board, onRefresh }) {
	const day = board.day;
	const defaultDate = day?.serviceDate ?? nextServiceDate(readClock());
	const [serviceDate, setServiceDate] = (0, import_react.useState)(defaultDate);
	const [dishName, setDishName] = (0, import_react.useState)(day?.dishName ?? DISH_PRESETS[0].name);
	const [photoUrl, setPhotoUrl] = (0, import_react.useState)(day?.photoUrl ?? DISH_PRESETS[0].photo);
	const [notes, setNotes] = (0, import_react.useState)(day?.notes ?? DISH_PRESETS[0].notes);
	const [capacity, setCapacity] = (0, import_react.useState)(day?.capacity ?? board.defaultCapacity);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [addingCustom, setAddingCustom] = (0, import_react.useState)(false);
	const [customName, setCustomName] = (0, import_react.useState)("");
	const [customNotes, setCustomNotes] = (0, import_react.useState)("");
	const [customPhoto, setCustomPhoto] = (0, import_react.useState)(null);
	const [customBusy, setCustomBusy] = (0, import_react.useState)(false);
	async function onFile(file) {
		if (!file) return;
		try {
			const data = await compressImage(file);
			setPhotoUrl(data);
		} catch {
			toast.error("No se pudo leer la foto.");
		}
	}
	async function onCustomFile(file) {
		if (!file) return;
		try {
			setCustomPhoto(await compressImage(file));
		} catch {
			toast.error("No se pudo leer la foto.");
		}
	}
	function pickDish(name, photo, notes) {
		setDishName(name);
		setPhotoUrl(photo);
		setNotes(notes);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Publicar el día"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Elige platillo, foto y notas. Se ve en la home al instante."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "date",
					children: "Fecha de venta"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "date",
					type: "date",
					value: serviceDate,
					onChange: (e) => setServiceDate(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm font-medium text-muted",
				children: "Platillo rápido"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					DISH_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => pickDish(p.name, p.photo, p.notes),
						className: `overflow-hidden rounded-md border text-left ${photoUrl === p.photo ? "border-ink" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: p.photo,
							alt: "",
							className: "h-16 w-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate px-2 py-1 text-xs font-medium text-ink",
							children: p.name
						})]
					}, p.id)),
					board.customDishes.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `relative overflow-hidden rounded-md border ${photoUrl === p.photo ? "border-ink" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute right-1 top-1 z-10 flex size-8 items-center justify-center rounded-sm bg-raised text-ink",
							"aria-label": `Quitar ${p.name}`,
							onClick: (e) => {
								e.preventDefault();
								e.stopPropagation();
								(async () => {
									try {
										await deleteCustomDish({ data: { id: p.id } });
										if (photoUrl === p.photo) setPhotoUrl(null);
										onRefresh();
									} catch (err) {
										toast.error(err instanceof Error ? err.message : "No se pudo borrar.");
									}
								})();
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "w-full text-left",
							onClick: () => pickDish(p.name, p.photo, p.notes),
							children: [p.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.photo,
								alt: "",
								className: "h-16 w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-16 items-center justify-center bg-line text-xs text-muted",
								children: "Sin foto"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate px-2 py-1 text-xs font-medium text-ink",
								children: p.name
							})]
						})]
					}, p.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setAddingCustom(true),
						className: "flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink/30 bg-raised px-2 text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold",
							children: "Otro platillo"
						})]
					})
				]
			})] }),
			addingCustom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 rounded-lg border border-line bg-raised p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-ink",
						children: "Nuevo platillo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "custom-name",
							children: "Nombre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "custom-name",
							value: customName,
							onChange: (e) => setCustomName(e.target.value),
							placeholder: "Ej. Arroz frito"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "custom-notes",
							children: "Notas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "custom-notes",
							value: customNotes,
							onChange: (e) => setCustomNotes(e.target.value),
							rows: 2,
							className: "w-full rounded-md border border-line bg-bg px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-chili/25"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "custom-photo",
							children: "Foto"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "custom-photo",
							type: "file",
							accept: "image/*",
							capture: "environment",
							className: "h-12 w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-line file:px-3 file:text-sm file:font-medium file:text-ink",
							onChange: (e) => void onCustomFile(e.target.files?.[0])
						})]
					}),
					customPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: customPhoto,
						alt: "",
						className: "h-28 w-full rounded-md object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: customBusy,
							onClick: () => {
								setAddingCustom(false);
								setCustomName("");
								setCustomNotes("");
								setCustomPhoto(null);
							},
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: customBusy,
							onClick: async () => {
								setCustomBusy(true);
								try {
									await saveCustomDish({ data: {
										name: customName,
										photoUrl: customPhoto,
										notes: customNotes
									} });
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
							},
							children: customBusy ? "Guardando…" : "Guardar"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "dish",
					children: "Nombre"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "dish",
					value: dishName,
					onChange: (e) => setDishName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "notes",
					children: "Notas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "notes",
					value: notes,
					onChange: (e) => setNotes(e.target.value),
					rows: 2,
					className: "w-full rounded-md border border-line bg-raised px-4 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-chili/25"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cap",
						children: "Capacidad"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cap",
						type: "number",
						min: 1,
						max: 40,
						value: capacity,
						onChange: (e) => setCapacity(Number(e.target.value))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "photo",
						children: "Foto (celular)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "photo",
						type: "file",
						accept: "image/*",
						capture: "environment",
						className: "h-12 w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-sm file:border-0 file:bg-line file:px-3 file:text-sm file:font-medium file:text-ink",
						onChange: (e) => void onFile(e.target.files?.[0])
					})]
				})]
			}),
			photoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photoUrl,
				alt: "",
				className: "h-40 w-full rounded-lg object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				disabled: busy,
				onClick: async () => {
					setBusy(true);
					try {
						await publishDay({ data: {
							serviceDate,
							dishName,
							photoUrl,
							notes,
							capacity
						} });
						toast.success("Publicado. Ya se ve en la home.");
						onRefresh();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "No se pudo publicar.");
					} finally {
						setBusy(false);
					}
				},
				children: busy ? "Publicando…" : day ? "Actualizar platillo" : "Publicar platillo"
			})
		]
	});
}
function MoneyStrip({ day, phase }) {
	const t = day.totals;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Dinero"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: phase === "leftover" ? "Sobrantes" : phase === "early" ? "Anticipadas" : phase
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Cobrado",
					value: formatMoney(t.collectedCents)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Pendiente",
					value: formatMoney(t.pendingCents)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Deudas",
					value: formatMoney(t.debtCents)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-muted",
			children: [
				day.reserved,
				" reservados · ",
				day.remaining,
				" libres · ",
				t.platesDelivered,
				" entregados"
			]
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-raised px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-medium uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-xl tabular-nums text-ink",
			children: value
		})]
	});
}
function ReservationList({ board, onRefresh }) {
	const rows = board.day?.reservations ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Reservas"
			}),
			rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nadie ha reservado todavía."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReservationCard, {
					row,
					onRefresh
				}, row.id))
			})
		]
	});
}
function ReservationCard({ row, onRefresh }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function patch(partial) {
		setBusy(true);
		try {
			await updateReservation({ data: {
				id: row.id,
				...partial
			} });
			onRefresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-line bg-raised p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold text-ink",
					children: row.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tabular-nums text-muted",
					children: row.phoneDisplay
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl tabular-nums text-ink",
					children: row.quantity
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					row.timeLabel,
					" · ",
					{
						pending: "Pendiente",
						cash: "Efectivo",
						online: "En línea",
						debt: "Deuda"
					}[row.paymentStatus],
					" · ",
					{
						reserved: "Reservado",
						delivered: "Entregado",
						noshow: "No se presentó",
						cancelled: "Cancelado"
					}[row.deliveryStatus]
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "leaf",
						disabled: busy,
						onClick: () => void patch({ deliveryStatus: "delivered" }),
						children: "Ya llegué"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => void patch({ paymentStatus: "cash" }),
						children: "Cash"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => void patch({ paymentStatus: "online" }),
						children: "Pago en línea"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => void patch({ paymentStatus: "debt" }),
						children: "Deuda"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "col-span-2",
						disabled: busy,
						onClick: () => void patch({ deliveryStatus: "noshow" }),
						children: "No se presentó"
					})
				]
			})
		]
	});
}
function DayActions({ onRefresh }) {
	const [message, setMessage] = (0, import_react.useState)("Hoy no voy. Tu reserva queda cancelada.");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3 border-t border-line pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Cerrar o cancelar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "cancel-msg",
				children: "Aviso si cancelas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "cancel-msg",
				value: message,
				onChange: (e) => setMessage(e.target.value),
				rows: 2,
				className: "w-full rounded-md border border-line bg-raised px-4 py-3 text-base text-ink outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				disabled: busy,
				onClick: async () => {
					if (!window.confirm("¿Cancelar el día y avisar en la home?")) return;
					setBusy(true);
					try {
						const result = await cancelDay({ data: { message } });
						toast.success(`Día cancelado. Aviso visible. SMS a ${result.wouldNotify} personas queda pendiente de Twilio.`);
						onRefresh();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "No se pudo cancelar.");
					} finally {
						setBusy(false);
					}
				},
				children: "Hoy no voy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				disabled: busy,
				onClick: async () => {
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
				},
				children: "Cerrar el día"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				disabled: busy,
				onClick: async () => {
					setBusy(true);
					try {
						const data = await reminderPreview();
						toast.message(data.message || "Nadie para recordar", { description: data.recipients.length === 0 ? "Sin reservas activas." : `${data.recipients.length} SMS de demo (Twilio pendiente): ${data.recipients.map((r) => r.name).join(", ")}` });
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "No se pudo armar el aviso.");
					} finally {
						setBusy(false);
					}
				},
				children: "Probar recordatorio de mañana"
			})
		]
	});
}
function DebtsTab({ board, onRefresh }) {
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const debts = board.debts ?? [];
	const debtCents = (board.day?.totals)?.debtCents ?? debts.reduce((n, d) => n + d.amountCents, 0);
	async function run(fn, ok) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-5 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Deudas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [formatMoney(debtCents), " abiertas. +10 y −10 mueven un plato."]
			})] }),
			board.day && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cobrado",
						value: formatMoney(board.day.totals.collectedCents)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pendiente",
						value: formatMoney(board.day.totals.pendingCents)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Deudas",
						value: formatMoney(board.day.totals.debtCents)
					})
				]
			}),
			debts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nadie debe nada. Márcalo en una reserva o agrégalo abajo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: debts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebtCard, {
					row,
					busy,
					run
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 border-t border-line pt-6",
				onSubmit: (e) => {
					e.preventDefault();
					run(() => addDebt({ data: {
						name,
						phone,
						quantity
					} }), "Deuda agregada.").then((ok) => {
						if (!ok) return;
						setName("");
						setPhone("");
						setQuantity(1);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl text-ink",
						children: "Agregar a mano"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "debt-name",
							children: "Nombre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "debt-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "debt-phone",
							children: "Teléfono"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "debt-phone",
							type: "tel",
							inputMode: "tel",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "debt-qty",
							children: "Platos a $10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "debt-qty",
							type: "number",
							min: 1,
							max: 40,
							value: quantity,
							onChange: (e) => setQuantity(Number(e.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						disabled: busy,
						children: busy ? "Guardando…" : `Agregar ${formatMoney(quantity * board.priceCents)}`
					})
				]
			})
		]
	});
}
function DebtCard({ row, busy, run }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-line bg-raised p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold text-ink",
					children: row.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tabular-nums text-muted",
					children: row.phoneDisplay
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs capitalize text-muted",
					children: row.dateLabel
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl tabular-nums text-ink",
				children: formatMoney(row.amountCents)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-2 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					disabled: busy,
					onClick: () => void run(() => adjustDebt({ data: {
						id: row.id,
						deltaPlates: 1
					} }), "Sumó $10."),
					children: "+10"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					disabled: busy || row.amountCents < 1e3,
					onClick: () => void run(() => adjustDebt({ data: {
						id: row.id,
						deltaPlates: -1
					} }), "Restó $10."),
					children: "−10"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "leaf",
					disabled: busy,
					onClick: () => void run(() => payDebt({ data: { id: row.id } }), "Marcada como pagada."),
					children: "Ya pagó"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy,
					onClick: () => void run(() => removeDebt({ data: { id: row.id } }), "Deuda quitada."),
					children: "Quitar deuda"
				})
			]
		})]
	});
}
function HistoryTab({ board }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Días anteriores"
			}),
			board.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Todavía no hay historial."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col",
				children: board.history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-3 border-b border-line py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium capitalize text-ink",
						children: [
							h.weekdayLabel,
							" · ",
							h.dishName
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							h.sold,
							" vendidos · ",
							h.leftover,
							" sobraron",
							h.status === "cancelled" ? " · cancelado" : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tabular-nums text-ink",
						children: formatMoney(h.collectedCents)
					})]
				}, h.id))
			})
		]
	});
}
function ConfigTab({ board, onRefresh }) {
	const [maxPerPerson, setMaxPerPerson] = (0, import_react.useState)(board.maxPerPerson === 2 ? 2 : 3);
	const [capacity, setCapacity] = (0, import_react.useState)(board.defaultCapacity);
	const [phaseOverride, setPhaseOverride] = (0, import_react.useState)(board.phaseOverride);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-5 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "Reglas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Precio fijo ",
					formatMoney(board.priceCents),
					". Reloj del servidor: ",
					board.now.ymd,
					" ",
					String(board.now.hour).padStart(2, "0"),
					":",
					String(board.now.minute).padStart(2, "0"),
					" ",
					board.now.tz,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tope por persona" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: [2, 3].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMaxPerPerson(n),
					className: `h-12 rounded-md border font-semibold ${maxPerPerson === n ? "border-ink bg-ink text-raised" : "border-line bg-raised"}`,
					children: n
				}, n))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "def-cap",
					children: "Capacidad por defecto"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "def-cap",
					type: "number",
					min: 1,
					max: 40,
					value: capacity,
					onChange: (e) => setCapacity(Number(e.target.value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fase (demo)" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs text-muted",
					children: "El corte real es a las 8:00 AM hora de Chicago. Esto solo simula la vista."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						[null, "Reloj"],
						["early", "Antes 8AM"],
						["leftover", "Sobrantes"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPhaseOverride(value),
						className: `h-12 rounded-md border text-sm font-semibold ${phaseOverride === value ? "border-ink bg-ink text-raised" : "border-line bg-raised"}`,
						children: label
					}, String(value)))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				disabled: busy,
				onClick: async () => {
					setBusy(true);
					try {
						await saveConfig({ data: {
							maxPerPerson,
							capacity,
							phaseOverride
						} });
						toast.success("Configuración guardada.");
						onRefresh();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
					} finally {
						setBusy(false);
					}
				},
				children: "Guardar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-line bg-raised p-4 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-ink",
					children: "Pendiente para producción"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 list-disc space-y-1 pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Twilio: código SMS, recordatorio de la mañana y aviso de “hoy no voy”." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Stripe: cobro en línea de $10. Hoy solo se marca el estado." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2FA al celular del vendedor." })
					]
				})]
			})
		]
	});
}
function AdminPage() {
	const initial = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPanel, { initial });
}
//#endregion
export { AdminPage as component };
