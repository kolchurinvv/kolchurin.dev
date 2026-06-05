/**
 * Physics POLISH — not a placer. Takes an already-good, tight layout (from the
 * constructive packer) as the starting state, then lets a gentle physics pass
 * add organic give: gravity pulls everything UP to close residual vertical gaps,
 * elastic "ropes" within each cluster let members flex (stretch with resistance)
 * off the rigid grid, and collisions keep it tight (no overlaps). Because it
 * starts from a deterministic, packed layout and only nudges, it stays tight and
 * mostly deterministic — unlike settling rectangles from scratch (loose, chaotic).
 *
 * No rotation (inertia = Infinity). Fixed timestep + step count → deterministic.
 * Reference: matter-js (https://www.npmjs.com/package/matter-js).
 */
import Matter from "matter-js"
import type { Position, TileMeta } from "./types"

export interface PhysicsInput {
  tiles: readonly TileMeta[]
  /** Starting layout to polish (e.g. the constructive packer's output). */
  initial: readonly Position[]
  viewport: { w: number; h: number }
  gutter: number
}

// ── tunable knobs ────────────────────────────────────────────────────────────
const STEPS = 800 // fixed → deterministic; polish, not a full settle
const DT = 1000 / 60
const GRAVITY_SCALE = 0.0016 // upward pull — closes gaps, staggers tiles off-grid
// Cluster "rope": resistance of the elastic band between members. Higher =
// stiffer (members hold formation); lower = they flex/drift more. THE knob.
const ROPE_STIFFNESS = 0.08
const ROPE_DAMPING = 0.1
// "Home" anchor: weak horizontal tether to the good constructive column, so
// tiles keep the distribution but are free to rise/stagger vertically (organic).
const HOME_STIFFNESS = 0.006

export function physicsPack(input: PhysicsInput): { positions: Position[]; totalHeight: number } {
  const { tiles, initial, viewport, gutter } = input
  if (initial.length === 0) return { positions: [], totalHeight: gutter }

  const innerW = Math.max(240, viewport.w - 2 * gutter)
  const pos = new Map(initial.map((p) => [p.id, p]))

  // ── world: gravity UP, left/right walls, ceiling at the top ────────────────
  const engine = Matter.Engine.create()
  engine.gravity.x = 0
  engine.gravity.y = -1
  engine.gravity.scale = GRAVITY_SCALE

  const WALL = 600
  const tall = 40000
  Matter.Composite.add(engine.world, [
    Matter.Bodies.rectangle(gutter - WALL / 2, 0, WALL, tall, { isStatic: true }),
    Matter.Bodies.rectangle(gutter + innerW + WALL / 2, 0, WALL, tall, { isStatic: true }),
    Matter.Bodies.rectangle(viewport.w / 2, gutter - WALL / 2, viewport.w + 2 * WALL, WALL, {
      isStatic: true,
    }),
  ])

  // ── a body per tile at its constructive position, anchored home ────────────
  const body = new Map<string, Matter.Body>()
  for (const p of initial) {
    const b = Matter.Bodies.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, {
      inertia: Number.POSITIVE_INFINITY,
      friction: 0.25,
      frictionStatic: 0.4,
      frictionAir: 0.08,
      restitution: 0,
      slop: 0.5,
    })
    body.set(p.id, b)
    Matter.Composite.add(engine.world, b)
    // weak home anchor → keeps the good distribution
    Matter.Composite.add(
      engine.world,
      Matter.Constraint.create({
        pointA: { x: p.x + p.w / 2, y: p.y + p.h / 2 },
        bodyB: b,
        length: 0,
        stiffness: HOME_STIFFNESS,
        damping: 0.08,
      })
    )
  }

  // ── elastic ropes within each cluster (complete graph, soft springs) ───────
  const clusters = new Map<string, TileMeta[]>()
  for (const t of tiles) {
    if (!t.cluster) continue
    const arr = clusters.get(t.cluster) ?? []
    arr.push(t)
    clusters.set(t.cluster, arr)
  }
  for (const members of clusters.values()) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = body.get(members[i].id)
        const b = body.get(members[j].id)
        const pa = pos.get(members[i].id)
        const pb = pos.get(members[j].id)
        if (!a || !b || !pa || !pb) continue
        // rest length = their current (constructive) centre distance, so the
        // rope holds the formation but yields elastically.
        const dx = pa.x + pa.w / 2 - (pb.x + pb.w / 2)
        const dy = pa.y + pa.h / 2 - (pb.y + pb.h / 2)
        Matter.Composite.add(
          engine.world,
          Matter.Constraint.create({
            bodyA: a,
            bodyB: b,
            length: Math.hypot(dx, dy),
            stiffness: ROPE_STIFFNESS,
            damping: ROPE_DAMPING,
          })
        )
      }
    }
  }

  // ── settle ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < STEPS; i++) {
    Matter.Engine.update(engine, DT)
    for (const b of body.values()) if (b.angle !== 0) Matter.Body.setAngle(b, 0)
  }

  // ── read positions, normalize so the topmost tile sits at gutter ───────────
  const out: Position[] = []
  let minTop = Number.POSITIVE_INFINITY
  for (const p of initial) {
    const b = body.get(p.id)
    if (!b) continue
    const top = b.position.y - p.h / 2
    minTop = Math.min(minTop, top)
    out.push({ id: p.id, x: b.position.x - p.w / 2, y: top, w: p.w, h: p.h })
  }
  const dy = gutter - minTop
  for (const p of out) {
    p.x = Math.round(p.x)
    p.y = Math.round(p.y + dy)
  }
  const totalHeight = Math.max(gutter, ...out.map((p) => p.y + p.h)) + gutter
  return { positions: out, totalHeight }
}
