"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, type IdentityCategory } from "@/lib/identity/classify";
import {
  buildIdentityGraph,
  type IdentityEdge,
  type IdentityNode,
  type RelationMode,
} from "@/lib/identity/graph";
import { cn } from "@/lib/utils";
import type { Vault, VaultItem } from "@/types";

/**
 * Canvas-rendered force graph. Canvas (instead of DOM/SVG nodes) keeps
 * hundreds of nodes at 60fps and makes the glow/gradient rendering
 * essentially free. d3-force drives the physics.
 */

interface IdentityGraphProps {
  items: VaultItem[];
  vaults: Vault[];
  mode: RelationMode;
  categories: IdentityCategory[];
  search: string;
  selectedId: string | null;
  showFavicons: boolean;
  onSelect: (item: VaultItem | null) => void;
}

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.6;

// Module-level favicon cache — shared across graph remounts.
const faviconCache = new Map<string, HTMLImageElement | "error">();

function loadFavicon(domain: string, onReady: () => void): void {
  if (faviconCache.has(domain)) return;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    faviconCache.set(domain, image);
    onReady();
  };
  image.onerror = () => faviconCache.set(domain, "error");
  faviconCache.set(domain, "error"); // replaced on load
  image.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

interface ViewTransform {
  scale: number;
  ox: number;
  oy: number;
}

export default function IdentityGraph({
  items,
  vaults,
  mode,
  categories,
  search,
  selectedId,
  showFavicons,
  onSelect,
}: IdentityGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipNode, setTooltipNode] = useState<IdentityNode | null>(null);

  const categoriesKey = categories.slice().sort().join(",");

  // Read-only copy for the legend. The simulation builds its own mutable
  // copy inside the effect below — d3-force owns those objects entirely,
  // keeping React-managed data immutable.
  const legendGroups = useMemo(
    () =>
      buildIdentityGraph({
        items,
        vaults,
        mode,
        categories: new Set(categories),
      }).groups,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categoriesKey stands in for the array identity
    [items, vaults, mode, categoriesKey],
  );

  // Draw-time UI state lives in a ref so changing it never rebuilds the
  // simulation — it only flags a redraw.
  const uiRef = useRef({ search, selectedId, showFavicons });
  const dirtyRef = useRef(true);
  useEffect(() => {
    uiRef.current = { search, selectedId, showFavicons };
    dirtyRef.current = true;
  }, [search, selectedId, showFavicons]);

  // Positions survive mode/filter changes for continuous transitions.
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Fresh mutable graph for d3 — never shared with React rendering.
    const { nodes, edges } = buildIdentityGraph({
      items,
      vaults,
      mode,
      categories: new Set(categoriesKey.split(",") as IdentityCategory[]),
    });
    const positions = positionsRef.current;

    // Seed positions: carry over, else start near the cluster anchor.
    for (const node of nodes) {
      const previous = positions.get(node.id);
      if (previous) {
        node.x = previous.x;
        node.y = previous.y;
      } else if (node.kind === "service") {
        node.x = node.tx + (Math.random() - 0.5) * 60;
        node.y = node.ty + (Math.random() - 0.5) * 60;
      }
    }

    const simulation = forceSimulation<IdentityNode>(nodes)
      .force("charge", forceManyBody<IdentityNode>().strength(-160).distanceMax(520))
      .force(
        "link",
        forceLink<IdentityNode, IdentityEdge>(edges)
          .id((node) => node.id)
          .distance((edge) => (edge.kind === "backbone" ? 195 : 82))
          .strength((edge) => (edge.kind === "backbone" ? 0.035 : 0.4)),
      )
      .force(
        "collide",
        forceCollide<IdentityNode>((node) => node.radius + 8).strength(0.85),
      )
      .force("cx", forceX<IdentityNode>((node) => node.tx).strength((node) => (node.kind === "user" ? 0 : 0.07)))
      .force("cy", forceY<IdentityNode>((node) => node.ty).strength((node) => (node.kind === "user" ? 0 : 0.07)))
      .alpha(1)
      .alphaDecay(reducedMotion ? 0.09 : 0.04);

    simulation.on("tick", () => {
      dirtyRef.current = true;
    });

    // --- View / sizing -----------------------------------------------
    const view: ViewTransform = { scale: 1, ox: 0, oy: 0 };
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const fitView = () => {
      view.scale = Math.min(width, height) / 820;
      view.scale = Math.min(Math.max(view.scale, MIN_ZOOM), MAX_ZOOM);
      view.ox = width / 2;
      view.oy = height / 2;
      dirtyRef.current = true;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      const firstSize = width === 0;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (firstSize) fitView();
      dirtyRef.current = true;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const toWorld = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left - view.ox) / view.scale,
        y: (clientY - rect.top - view.oy) / view.scale,
      };
    };

    const hitTest = (clientX: number, clientY: number): IdentityNode | null => {
      const point = toWorld(clientX, clientY);
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dx = (node.x ?? 0) - point.x;
        const dy = (node.y ?? 0) - point.y;
        const reach = node.radius + 6;
        if (dx * dx + dy * dy <= reach * reach) return node;
      }
      return null;
    };

    // --- Emphasis (search / hover / selection) -----------------------
    let hoveredId: string | null = null;
    const neighborsOf = (id: string): Set<string> => {
      const set = new Set<string>([id]);
      for (const edge of edges) {
        const source = typeof edge.source === "object" ? edge.source.id : edge.source;
        const target = typeof edge.target === "object" ? edge.target.id : edge.target;
        if (source === id) set.add(target);
        if (target === id) set.add(source);
      }
      return set;
    };

    const emphasisMap = (): Map<string, number> => {
      const { search: query, selectedId: selected } = uiRef.current;
      const map = new Map<string, number>();
      const q = query.trim().toLowerCase();
      for (const node of nodes) {
        let alpha = 1;
        if (q) {
          const haystack =
            `${node.label} ${node.item?.username ?? ""} ${node.domain ?? ""}`.toLowerCase();
          alpha = haystack.includes(q) || node.kind === "user" ? 1 : 0.1;
        }
        map.set(node.id, alpha);
      }
      const focusId = hoveredId ?? selected;
      if (focusId && map.get(focusId) !== undefined) {
        const related = neighborsOf(focusId);
        for (const node of nodes) {
          if (!related.has(node.id)) {
            map.set(node.id, Math.min(map.get(node.id) ?? 1, 0.22));
          }
        }
      }
      return map;
    };

    // --- Drawing -----------------------------------------------------
    let dashOffset = 0;

    const drawNode = (
      node: IdentityNode,
      alpha: number,
      focused: boolean,
    ) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = node.radius;
      ctx.globalAlpha = alpha;

      // Glow halo
      const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (focused ? 3 : 2.3));
      glow.addColorStop(0, `${node.color}${focused ? "7d" : "4d"}`);
      glow.addColorStop(1, `${node.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * (focused ? 3 : 2.3), 0, Math.PI * 2);
      ctx.fill();

      if (node.kind === "user") {
        const orb = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.2, x, y, r);
        orb.addColorStop(0, "#60a5fa");
        orb.addColorStop(1, "#2563eb");
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "600 11px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("You", x, y);
        return;
      }

      // Glass disc
      ctx.fillStyle = "rgba(13, 18, 30, 0.92)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `${node.color}${focused ? "e6" : "8c"}`;
      ctx.lineWidth = focused ? 2 : 1.4;
      ctx.stroke();

      // Risk rings — flag-driven so future AI annotations render free.
      if (node.flags.includes("weak")) {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, r + 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (node.flags.includes("reused")) {
        ctx.strokeStyle = "rgba(251, 113, 133, 0.8)";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(x, y, r + (node.flags.includes("weak") ? 6.5 : 3.5), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Favicon (when available) or monogram
      const icon =
        uiRef.current.showFavicons && node.domain
          ? faviconCache.get(node.domain)
          : undefined;
      if (icon && icon !== "error") {
        const size = (r - 4) * 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r - 4, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
        ctx.restore();
      } else {
        if (uiRef.current.showFavicons && node.domain) {
          loadFavicon(node.domain, () => {
            dirtyRef.current = true;
          });
        }
        ctx.fillStyle = "rgba(241, 245, 249, 0.92)";
        ctx.font = `600 ${Math.round(r * 0.85)}px ui-sans-serif, system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label.charAt(0).toUpperCase(), x, y + 0.5);
      }

      // Label
      const showLabel =
        focused || view.scale > 1.05 || node.item?.favorite === true;
      if (showLabel) {
        ctx.fillStyle = `rgba(226, 232, 240, ${focused ? 0.95 : 0.66})`;
        ctx.font = "500 10.5px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.label, x, y + r + 7);
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.setTransform(
        dpr * view.scale,
        0,
        0,
        dpr * view.scale,
        dpr * view.ox,
        dpr * view.oy,
      );

      const emphasis = emphasisMap();
      const { selectedId: selected } = uiRef.current;

      for (const edge of edges) {
        const source = edge.source as IdentityNode;
        const target = edge.target as IdentityNode;
        if (typeof source !== "object" || typeof target !== "object") continue;
        const alpha = Math.min(
          emphasis.get(source.id) ?? 1,
          emphasis.get(target.id) ?? 1,
        );
        ctx.globalAlpha = alpha * (edge.kind === "backbone" ? 0.45 : 0.85);
        ctx.strokeStyle =
          edge.kind === "backbone" ? "rgba(148, 163, 184, 0.22)" : `${edge.color}66`;
        ctx.lineWidth = edge.kind === "backbone" ? 1 : 1.5;
        if (edge.kind === "relation") {
          ctx.setLineDash([5, 7]);
          ctx.lineDashOffset = dashOffset;
        }
        ctx.beginPath();
        ctx.moveTo(source.x ?? 0, source.y ?? 0);
        ctx.lineTo(target.x ?? 0, target.y ?? 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      for (const node of nodes) {
        const focused =
          node.id === hoveredId || (selected !== null && node.id === selected);
        drawNode(node, emphasis.get(node.id) ?? 1, focused);
      }
      ctx.globalAlpha = 1;
    };

    // --- Render loop -------------------------------------------------
    let rafId = 0;
    let stopped = false;
    const frame = () => {
      if (stopped) return;
      rafId = requestAnimationFrame(frame);
      if (!reducedMotion) {
        dashOffset -= 0.35;
        draw();
        dirtyRef.current = false;
      } else if (dirtyRef.current) {
        draw();
        dirtyRef.current = false;
      }
    };
    rafId = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        stopped = true;
        cancelAnimationFrame(rafId);
        simulation.stop();
      } else {
        stopped = false;
        simulation.restart();
        rafId = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- Interactions ------------------------------------------------
    let dragNode: IdentityNode | null = null;
    let panning = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;

    const updateTooltip = (node: IdentityNode | null, clientX?: number, clientY?: number) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (node && node.kind === "service" && clientX !== undefined && clientY !== undefined) {
        const rect = container.getBoundingClientRect();
        const x = Math.min(clientX - rect.left + 14, rect.width - 240);
        const y = Math.min(clientY - rect.top + 14, rect.height - 150);
        tooltip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      setTooltipNode((current) =>
        current?.id === node?.id ? current : node?.kind === "service" ? node : null,
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      moved = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      const hit = hitTest(event.clientX, event.clientY);
      if (hit && hit.kind === "service") {
        dragNode = hit;
        simulation.alphaTarget(0.25).restart();
      } else {
        panning = true;
      }
      updateTooltip(null);
    };

    const onPointerMove = (event: PointerEvent) => {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (dragNode || panning) {
        moved += Math.abs(dx) + Math.abs(dy);
      }
      if (dragNode) {
        const point = toWorld(event.clientX, event.clientY);
        dragNode.fx = point.x;
        dragNode.fy = point.y;
        dirtyRef.current = true;
      } else if (panning) {
        view.ox += dx;
        view.oy += dy;
        dirtyRef.current = true;
      } else {
        const hit = hitTest(event.clientX, event.clientY);
        const nextId = hit && hit.kind === "service" ? hit.id : null;
        if (nextId !== hoveredId) {
          hoveredId = nextId;
          dirtyRef.current = true;
        }
        canvas.style.cursor = hit ? "pointer" : "grab";
        updateTooltip(hit, event.clientX, event.clientY);
      }
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragNode) {
        const wasClick = moved < 6;
        dragNode.fx = null;
        dragNode.fy = null;
        simulation.alphaTarget(0);
        if (wasClick && dragNode.item) onSelect(dragNode.item);
        dragNode = null;
      } else if (panning) {
        if (moved < 6 && !hitTest(event.clientX, event.clientY)) {
          onSelect(null);
        }
        panning = false;
      }
    };

    const onPointerLeave = () => {
      if (hoveredId) {
        hoveredId = null;
        dirtyRef.current = true;
      }
      updateTooltip(null);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const factor = Math.exp(-event.deltaY * 0.0012);
      const next = Math.min(Math.max(view.scale * factor, MIN_ZOOM), MAX_ZOOM);
      // Zoom toward the cursor.
      view.ox = mx - ((mx - view.ox) / view.scale) * next;
      view.oy = my - ((my - view.oy) / view.scale) * next;
      view.scale = next;
      dirtyRef.current = true;
    };

    const onDoubleClick = () => {
      fitView();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDoubleClick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      for (const node of nodes) {
        positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
      }
      simulation.stop();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDoubleClick);
      resizeObserver.disconnect();
    };
  }, [items, vaults, mode, categoriesKey, onSelect]);

  return (
    <div ref={containerRef} className="relative size-full">
      <canvas
        ref={canvasRef}
        className="block size-full cursor-grab touch-none"
        role="application"
        aria-label="Interactive identity graph. Use the search field and filters to explore your accounts."
      />

      {/* Legend for the current grouping */}
      <div
        className="pointer-events-none absolute bottom-3 left-3 flex max-w-[80%] flex-wrap gap-1.5"
        aria-hidden="true"
      >
        {legendGroups.slice(0, 8).map((group) => (
          <span
            key={group.key}
            className="glass flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            {group.label}
            <span className="tabular-nums opacity-60">{group.count}</span>
          </span>
        ))}
      </div>

      {/* Hover card */}
      <div
        ref={tooltipRef}
        className={cn(
          "glass pointer-events-none absolute top-0 left-0 z-10 w-56 rounded-xl border p-3 shadow-xl transition-opacity duration-150",
          tooltipNode ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      >
        {tooltipNode?.item && (
          <>
            <p className="text-sm font-semibold">{tooltipNode.label}</p>
            {tooltipNode.item.username && (
              <p className="truncate text-xs text-muted-foreground">
                {tooltipNode.item.username}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {tooltipNode.category && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px]"
                  style={{ color: CATEGORY_META[tooltipNode.category].color }}
                >
                  {CATEGORY_META[tooltipNode.category].label}
                </Badge>
              )}
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {tooltipNode.vaultName}
              </Badge>
              {tooltipNode.flags.includes("weak") && (
                <Badge className="h-5 bg-warning/15 px-1.5 text-[10px] text-warning">
                  Weak
                </Badge>
              )}
              {tooltipNode.flags.includes("reused") && (
                <Badge className="h-5 bg-destructive/15 px-1.5 text-[10px] text-destructive">
                  Reused
                </Badge>
              )}
            </div>
            {tooltipNode.strength !== null && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${tooltipNode.strength}%`,
                    backgroundColor:
                      tooltipNode.strength >= 55 ? "#22c55e" : "#f59e0b",
                  }}
                />
              </div>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              Updated{" "}
              {formatDistanceToNow(new Date(tooltipNode.item.updatedAt), {
                addSuffix: true,
              })}{" "}
              · click for details
            </p>
          </>
        )}
      </div>
    </div>
  );
}
