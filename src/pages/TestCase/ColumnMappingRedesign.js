import React, { useRef, useState, useEffect, useMemo } from "react";

const ColumnMappingRedesign = ({
    sourceTableObj,
    targetTableObj,
    columnMappings,
    setColumnMappings
}) => {

	// build initialTables from props: sourceTableObj and targetTableObj
	const initialTables = useMemo(() => {
		const res = [];
		const leftX = 20;
		const rightX = 420;
		// source tables (place on left)
		const srcNames = Object.keys(sourceTableObj || {});
		srcNames.forEach((name, idx) => {
			const cols = Object.keys(sourceTableObj[name] || {});
			res.push({
				name,
				type: 'source',
				x: leftX + Math.floor(Math.random() * 40),
				y: 20 + idx * 240 + Math.floor(Math.random() * 40),
				columns: cols,
			});
		});
		// target tables (place on right)
		const tgtNames = Object.keys(targetTableObj || {});
		tgtNames.forEach((name, idx) => {
			const cols = Object.keys(targetTableObj[name] || {});
			res.push({
				name,
				type: 'target',
				x: rightX + Math.floor(Math.random() * 40),
				y: 80 + idx * 240 + Math.floor(Math.random() * 40),
				columns: cols,
			});
		});
		return res;
	}, [sourceTableObj, targetTableObj]);

	const wrapperRef = useRef(null);
	const innerRef = useRef(null);
	const controlsRef = useRef(null);
	const fullscreenRef = useRef(null);
	const [tables, setTables] = useState(() => initialTables || []);

	useEffect(() => {
		// update tables when computed initialTables changes (e.g. after async props load)
		setTables(initialTables || []);
		// force a re-render after a brief delay to let DOM settle
		const timer = setTimeout(() => setForceRender(prev => prev + 1), 100);
		return () => clearTimeout(timer);
	}, [initialTables]);

	const [scale, setScale] = useState(1);
	const [tx, setTx] = useState(0);
	const [ty, setTy] = useState(0);
	const [draggingTable, setDraggingTable] = useState(null); // {id, offsetX, offsetY}
	const [panning, setPanning] = useState(null); // {startX,startY,origTx,origTy}
	const [drawing, setDrawing] = useState(null); // {from:{tableName,col}, startClient:{x,y}}
	const [pointer, setPointer] = useState({ x: 0, y: 0 }); // current mouse for temp line
	const [forceRender, setForceRender] = useState(0);

	// Helpers to convert client coords to inner-content coordinates
	const getContainerRect = () => wrapperRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

	// helper to detect target/source by table name
	const isTargetTable = (tableName) => {
		return Object.keys(targetTableObj || {}).includes(tableName);
	};

	// work directly with columnMappings prop (no local state)
	const addMapping = (from, to) => {
		const newMapping = {
			sourceTable: from.tableName,
			sourceColumn: from.col,
			targetTable: to.tableName,
			targetColumn: to.col
		};

		// Check for duplicate mapping before adding
		const isDuplicate = columnMappings.some((mapping) => {
			let sourceTableName = newMapping.sourceTable;
			let targetTableName = newMapping.targetTable;
			if(from.tableName.startsWith("(source)-")){
				sourceTableName = from.tableName.replace("(source)-", "");
				targetTableName = to.tableName.replace("(target)-", "");
			}
			return (mapping.sourceTable === sourceTableName 
			&& mapping.sourceColumn === newMapping.sourceColumn 
			&& mapping.targetTable === targetTableName 
			&& mapping.targetColumn === newMapping.targetColumn)
		});
		if (!isDuplicate) {
			setColumnMappings([...columnMappings, newMapping]);
		}
	};

	const removeMapping = (idx) => {
		setColumnMappings(columnMappings.filter((_, i) => i !== idx));
	};

    const getColumnElementAtPoint = (clientX, clientY) => {
        // try elementFromPoint first (fast)
        let el = document.elementFromPoint(clientX, clientY);
        if (el && el.getAttribute && el.hasAttribute('data-table') && el.hasAttribute('data-col')) {
            return el;
        }
        // fallback: brute-force test all column elements (tolerant to overlays)
        const els = Array.from(document.querySelectorAll('[data-table][data-col]'));
        for (const candidate of els) {
            const r = candidate.getBoundingClientRect();
            // allow small tolerance (3px) to account for stroke overlap / rounding
            if (clientX >= r.left - 3 && clientX <= r.right + 3 && clientY >= r.top - 3 && clientY <= r.bottom + 3) {
                return candidate;
            }
        }
        return null;
    };

	// table dragging
	useEffect(() => {
		const onMove = (e) => {
			if (draggingTable) {
				const rect = getContainerRect();
				const clientX = e.clientX;
				const clientY = e.clientY;
				const innerX = (clientX - rect.left - tx) / scale - draggingTable.offsetX;
				const innerY = (clientY - rect.top - ty) / scale - draggingTable.offsetY;
				setTables((prev) =>
					prev.map((t) => (t.name === draggingTable.name && t.type === draggingTable.type ? { ...t, x: innerX, y: innerY } : t))
				);
			} else if (panning) {
				const dx = e.clientX - panning.startX;
				const dy = e.clientY - panning.startY;
				setTx(panning.origTx + dx);
				setTy(panning.origTy + dy);
			} else if (drawing) {
				setPointer({ x: e.clientX, y: e.clientY });
			}
		};

		const onUp = (e) => {
			if (draggingTable) {
				setDraggingTable(null);
			}
			if (panning) {
				setPanning(null);
			}
			if (drawing) {
				// robust hit-test for target column
				const hit = getColumnElementAtPoint(e.clientX, e.clientY);
				if (hit) {
					const tgtTable = hit.getAttribute("data-table");
					const tgtCol = hit.getAttribute("data-col");
					if (tgtTable && tgtCol) {
						const from = drawing.from;
						const to = { tableName: tgtTable, col: tgtCol };
						const fromIsTarget = isTargetTable(from.tableName);
						const toIsTarget = isTargetTable(to.tableName);
						if (!fromIsTarget && toIsTarget && !(from.tableName === to.tableName && from.col === to.col)) {
							addMapping(from, to);
						}
					}
				}
				setDrawing(null);
			}
		};
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		};
	}, [draggingTable, panning, drawing, tx, ty, scale, tables, targetTableObj]);

	// double-click to delete mapping (detect element under cursor)
	// useEffect(() => {
	// 	const onDbl = (e) => {
	// 		const el = document.elementFromPoint(e.clientX, e.clientY);
			
	// 		if (!el) return;
	// 		const idx = el.getAttribute?.("data-mapping-index");
	// 		if (idx != null) {
	// 			const i = Number(idx);
	// 			removeMapping(i);
	// 		}
	// 	};
	// 	window.addEventListener("dblclick", onDbl);
	// 	return () => window.removeEventListener("dblclick", onDbl);
	// }, [columnMappings]);

	// start dragging a table
	const startTableDrag = (e, table) => {
		e.stopPropagation();
		// get pointer pos inside the table element in inner coords
		const rect = wrapperRef.current.getBoundingClientRect();
		const clientX = e.clientX;
		const clientY = e.clientY;
		const innerX = (clientX - rect.left - tx) / scale;
		const innerY = (clientY - rect.top - ty) / scale;
		const offsetX = innerX - table.x;
		const offsetY = innerY - table.y;
		setDraggingTable({ name: table.name, type: table.type, offsetX, offsetY });
	};

	// start panning (background drag)
	const startPan = (e) => {
		// only start panning for right-click or if ctrl pressed or background clicked
		if (e.button === 2) return; // ignore right click
		if (e.target !== wrapperRef.current) return;
		setPanning({ startX: e.clientX, startY: e.clientY, origTx: tx, origTy: ty });
	};

	// start drawing mapping from a column
	const startColumnDraw = (e, tableName, col) => {
		e.stopPropagation();
		e.preventDefault();
		if (isTargetTable(tableName)) return;
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		setDrawing({
			from: { tableName, col },
			startClient: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
		});
		setPointer({ x: e.clientX, y: e.clientY });
	};

	const zoomTo = (newScale, centerClient) => {
		const rect = getContainerRect();
		if (!centerClient) {
			// zoom relative to center of container
			centerClient = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		}
		// convert center to inner coords before zoom
		const innerCX = (centerClient.x - rect.left - tx) / scale;
		const innerCY = (centerClient.y - rect.top - ty) / scale;
		// new translation so that innerCX,innerCY stays under the same client point
		const newTx = centerClient.x - rect.left - innerCX * newScale;
		const newTy = centerClient.y - rect.top - innerCY * newScale;
		setScale(newScale);
		setTx(newTx);
		setTy(newTy);
	};

	const zoomIn = () => {
        zoomTo(scale * 1.15);
		setForceRender(prev => prev + 1);
    };

    const zoomOut = () => {
        zoomTo(scale / 1.15);
		setForceRender(prev => prev + 1);
    };

	const resetView = () => {
		setScale(1);
		setTx(0);
		setTy(0);
		setForceRender(prev => prev + 1);
	};

	const toggleFullscreen = async () => {
		if (!document.fullscreenElement) {
			try {
				await fullscreenRef.current.requestFullscreen();
			} catch (err) {
				/* ignore */
			}
		} else {
			await document.exitFullscreen();
		}
	};

	// helpers to get center point of a column element for drawing lines
    const getElementCenter = (el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        const containerRect = getContainerRect();
        // convert client coords to inner content coords, accounting for zoom/pan
        const x = (r.left + r.width / 2 - containerRect.left - tx) / scale;
        const y = (r.top + r.height / 2 - containerRect.top - ty) / scale;
        return { x, y };
    };

	// compute SVG lines from columnMappings + temporary drawing
	const renderLines = () => {
        forceRender;
        const containerRect = getContainerRect();

        // build markers for all mappings once at root defs
        const markers = columnMappings.map((m, idx) => (
            <marker
                key={`marker-${idx}`}
                id={`arrow-${idx}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
            >
                <path d="M0,0 L8,4 L0,8 z" fill="#1e88e5" />
            </marker>
        ));

        const points = columnMappings.map((m, idx) => {
            let fromEl, toEl;
            // if source/target share same names we may prefix UI element names elsewhere; selector logic preserved
            if (m.sourceTable === m.targetTable) {
                fromEl = document.querySelector(
                    `[data-table="(source)-${m.sourceTable}"][data-col="${m.sourceColumn}"]`
                );
                toEl = document.querySelector(
                    `[data-table="(target)-${m.targetTable}"][data-col="${m.targetColumn}"]`
                );
            } else {
                fromEl = document.querySelector(
                    `[data-table="${m.sourceTable}"][data-col="${m.sourceColumn}"]`
                );
                toEl = document.querySelector(
                    `[data-table="${m.targetTable}"][data-col="${m.targetColumn}"]`
                );
            }

            if (!fromEl || !toEl) return null;

            const p1 = getElementCenter(fromEl);
            const p2 = getElementCenter(toEl);

            // path uses cubic bezier with small offsets
            const d = `M ${p1.x} ${p1.y} C ${p1.x + 60} ${p1.y} , ${p2.x - 60} ${p2.y} , ${p2.x - 15} ${p2.y}`;

            return (
                <path
                    key={`path-${idx}`}
                    data-mapping-index={idx}
                    d={d}
                    stroke="#1e88e5"
                    strokeWidth="2"
                    fill="none"
                    markerEnd={`url(#arrow-${idx})`}
                    style={{ cursor: "pointer", pointerEvents: "visibleStroke" }}
                    onDoubleClick={(ev) => {
                        ev.stopPropagation();
                        removeMapping(idx);
                    }}
                    onMouseEnter={(ev) => {
                        // highlight the stroke on hover
                        ev.currentTarget.setAttribute("stroke", "#ff5722");
                        ev.currentTarget.setAttribute("stroke-width", "3");
                    }}
                    onMouseLeave={(ev) => {
                        ev.currentTarget.setAttribute("stroke", "#1e88e5");
                        ev.currentTarget.setAttribute("stroke-width", "2");
                    }}
                />
            );
        });

        // temp line while drawing
        let temp = null;
        if (drawing) {
            const start = drawing.startClient;
            const rect = containerRect;
            const sx = start.x - rect.left;
            const sy = start.y - rect.top;
            const ex = pointer.x - rect.left;
            const ey = pointer.y - rect.top;
            temp = (
                <path
                    d={`M ${sx} ${sy} C ${sx + 60} ${sy} , ${ex - 60} ${ey} , ${ex} ${ey}`}
                    stroke="#ff5722"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#tempArrow)"
                    style={{ pointerEvents: "none" }} // temp line should not intercept clicks
                />
            );
        }

        return (
            <svg style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
                <defs>
                    {markers}
                    <marker id="tempArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                        <path d="M0,0 L8,4 L0,8 z" fill="#ff5722" />
                    </marker>
                </defs>

                {/* render mapped paths */}
                {points}
                {/* render temp drawing path on top */}
                {temp}
            </svg>
        );
    };

	// small styles inline and a style tag
	const styles = {
		// dotted playground background
		wrapper: {
			width: "100%",
			height: "600px",
			border: "1px solid #ddd",
			position: "relative",
			overflow: "hidden",
			background: "#fafafa",
			backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
			backgroundSize: "20px 20px",
			marginBottom: 100,
		},
		inner: {
			position: "absolute",
			left: 0,
			top: 0,
			transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
			transformOrigin: "0 0",
			width: "10000px",
			height: "10000px",
		},
		svgOverlay: {
			position: "absolute",
			left: 0,
			top: 0,
			width: "100%",
			height: "100%",
			// allow pointer events so paths can be detected (we use global dblclick detection)
			pointerEvents: "auto",
		},
		table: {
			position: "absolute",
			width: "260px",
			background: "#fff",
			border: "1px solid #ccc",
			boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
			borderRadius: "4px",
			userSelect: "none",
		},
		tableHeader: {
			padding: "8px 10px",
			background: "#f5f5f5",
			borderBottom: "1px solid #eee",
			fontSize: "13px",
			fontWeight: 600,
		},
		colRow: {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			padding: "6px 10px",
			borderBottom: "1px dashed #f0f0f0",
			fontSize: "13px",
		},
		colHandle: {
			width: 12,
			height: 12,
			borderRadius: 6,
			background: "#1e88e5",
			marginLeft: 8,
			cursor: "crosshair",
		},
		colHandleLeft: {
			width: 12,
			height: 12,
			borderRadius: 6,
			background: "#1e88e5",
			marginRight: 8,
			cursor: "crosshair",
		},
		controls: {
			display: "flex",
			gap: 8,
			marginBottom: 10,
			marginTop: 10,
			justifyContent: "flex-end",
		},
	};

	return (
		<>
			<style>{`
				div[data-fullscreen-container]:fullscreen {
					width: 100vw !important;
					height: 100vh !important;
					display: flex;
					flex-direction: column;
				}
				div[data-fullscreen-container]:fullscreen > div[data-canvas-wrapper] {
					flex: 1;
					height: 100% !important;
					margin-bottom: 0 !important;
				}
			`}</style>
			<div ref={fullscreenRef} data-fullscreen-container style={{ width: "100%", height: "100%" }}>
				<div style={styles.controls} ref={controlsRef}>
					<button onClick={zoomIn}>Zoom in</button>
					<button onClick={zoomOut}>Zoom out</button>
					<button onClick={resetView}>Reset</button>
					<button onClick={toggleFullscreen}>Fullscreen</button>
					<div style={{ marginLeft: 12, color: "#666", fontSize: 13 }}>
						Scale: {Math.round(scale * 100)}% — Mappings: {columnMappings.length}
					</div>
				</div>
				<div
					ref={wrapperRef}
					data-canvas-wrapper
					style={styles.wrapper}
					onMouseDown={startPan}
					onContextMenu={(e) => e.preventDefault()}
				>
					{/* inner transformed content: tables live here */}
					<div ref={innerRef} style={styles.inner}>
						{tables.map((t) => (
							<div
								key={`${t.type}-${t.name}`}
								style={{
									...styles.table,
									left: t.x,
									top: t.y,
								}}
								onMouseDown={(e) => startTableDrag(e, t)}
							>
								<div style={styles.tableHeader}>{t.name}</div>
								<div>
									{t.columns.map((c) => {
										const isTarget = isTargetTable(t.name);
										return (
											<div key={c} style={styles.colRow}>
												{isTarget ? (
													<>
														<div
															data-table={t.name}
															data-col={c}
															onMouseDown={(e) => startColumnDraw(e, t.name, c)}
															style={styles.colHandleLeft}
															title="drag to map"
														/>
														<div>{c}</div>
													</>
												) : (
													<>
														<div>{c}</div>
														<div
															data-table={t.name}
															data-col={c}
															onMouseDown={(e) => startColumnDraw(e, t.name, c)}
															style={styles.colHandle}
															title="drag to map"
														/>
													</>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}

						{/* svg overlay for lines - placed inside inner so it shares transform.
							SVG root doesn't intercept pointer events (pointerEvents:'none'),
							individual paths set pointerEvents:'visibleStroke' so they can receive events. */}
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
                        { /* renderLines returns an <svg> - ensure its root has pointerEvents:'none' */ }
                        {renderLines()}
                    </div>
					</div>
				</div>
			</div>
		</>
    );
};

export default ColumnMappingRedesign;
