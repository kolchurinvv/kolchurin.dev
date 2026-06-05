#!/usr/bin/env node
/**
 * Bento layout inspector — a reusable, headless diagnostic for the /bento route.
 *
 * Replaces the throwaway one-off probes: one committed tool that reports the
 * invariants we actually care about, per viewport width, with PASS/FAIL flags
 * and a non-zero exit on hard failures (so it doubles as a smoke gate).
 *
 * Usage (needs a server running — `just frontend-dev`, or point at a preview):
 *   node scripts/bento-probe.mjs
 *   node scripts/bento-probe.mjs --widths=1280,1440,1920
 *   node scripts/bento-probe.mjs --url=http://localhost:4173/bento --shots=/tmp
 *   node scripts/bento-probe.mjs --verbose          # per-tile geometry table
 *
 * Chromium: resolved from $PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, else a NixOS
 * fallback, else Playwright's bundled browser.
 */
import { existsSync } from "node:fs"
import { chromium } from "playwright"

// ── args ────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=")
    return [k, v ?? true]
  })
)
const URL = args.url ?? "http://localhost:5179/bento"
const WIDTHS = String(args.widths ?? "1280,1440,1920").split(",").map(Number)
const VERBOSE = Boolean(args.verbose)
const SHOTS = typeof args.shots === "string" ? args.shots : null

const NIX_CHROMIUM = "/nix/store/b5chknh5501v96xipynfdyfxjvn55jbw-chromium-147.0.7727.116/bin/chromium"
const execPath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync(NIX_CHROMIUM) ? NIX_CHROMIUM : undefined)

// Skill cluster ids (kept in sync with inventory.ts).
const SKILL_IDS = ["skills-backend", "skills-cloud", "skills-networking", "skills-ai"]

// ── in-page collectors ───────────────────────────────────────────────────────
const collect = (page) =>
  page.evaluate(() => {
    const tiles = [...document.querySelectorAll("[data-tile]")].map((el) => {
      const r = el.getBoundingClientRect()
      const card = el.querySelector(".card") ?? el
      return {
        id: el.dataset.tile,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        clipX: Math.max(0, card.scrollWidth - card.clientWidth),
        clipY: Math.max(0, card.scrollHeight - card.clientHeight),
      }
    })
    const container = document.querySelector(".bento-container")
    const c = container.getBoundingClientRect()
    const tileArea = tiles.reduce((s, t) => s + t.w * t.h, 0)
    const scrollEl = document.scrollingElement || document.documentElement
    return {
      wallW: Math.round(c.width),
      wallH: Math.round(c.height),
      containerH: Math.round(container.offsetHeight),
      docScrollH: scrollEl.scrollHeight,
      maxTileBottom: Math.round(Math.max(...tiles.map((t) => t.y + t.h))), // doc-abs at scrollY=0
      tileArea,
      tiles,
    }
  })

// Largest vertical band (height in px) where the wall is mostly empty across its
// used width — i.e. the "huge gap". Scans in 16px steps.
function maxGap(tiles, top, bottom, left, right) {
  const W = right - left
  let run = 0
  let worst = 0
  let worstY = 0
  for (let y = top; y < bottom; y += 16) {
    let covered = 0
    for (const t of tiles) {
      if (t.y <= y && t.y + t.h > y) covered += Math.min(t.x + t.w, right) - Math.max(t.x, left)
    }
    if (covered / W < 0.12) {
      run += 16
      if (run > worst) {
        worst = run
        worstY = y - run
      }
    } else run = 0
  }
  return { gap: worst, atY: worstY }
}

const sig = (tiles) => JSON.stringify(tiles.map((t) => [t.id, t.x, t.y, t.w, t.h]))

// Connectivity of a tile group: members are adjacent if they overlap on one
// axis and the gap on the other is within `tol` (a gutter). Returns stray ids.
function strays(group, tol = 24) {
  const adj = (a, b) => {
    const xo = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    const yo = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
    const xg = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w)
    const yg = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h)
    return (yo > 4 && xg <= tol && xg >= -2) || (xo > 4 && yg <= tol && yg >= -2)
  }
  return group.filter((a) => !group.some((b) => b !== a && adj(a, b))).map((t) => t.id)
}

// ── run ───────────────────────────────────────────────────────────────────────
const pass = (b) => (b ? "✓" : "✗ FAIL")
let anyFail = false

const browser = await chromium.launch(execPath ? { executablePath: execPath } : {})
try {
  for (const W of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: W, height: 1000 } })
    let ready = true
    await page.goto(URL, { waitUntil: "networkidle" })
    await page
      .waitForFunction(() => document.querySelector(".bento-container")?.dataset.ready === "yes", {
        timeout: 8000,
      })
      .catch(() => {
        ready = false
      })

    if (!ready) {
      console.log(`\n=== ${W} ===  ✗ FAIL never reached data-ready=yes`)
      anyFail = true
      await page.close()
      continue
    }

    const a = await collect(page)
    await page.waitForTimeout(1500)
    const b = await collect(page)

    // Does the page actually scroll to the bottom? (functional scroll check)
    const scrollReach = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement
      el.scrollTop = 1e7
      const reached = el.scrollTop
      const max = el.scrollHeight - el.clientHeight
      el.scrollTop = 0
      return { reached: Math.round(reached), max: Math.round(max) }
    })
    const canScroll = scrollReach.max < 4 || scrollReach.reached >= scrollReach.max - 4

    // Reproduce "mouse enters → scrollbar fills → no scroll": nudge the width by
    // a scrollbar's worth (forces a recompute) and a mouse move, then see if the
    // wall height collapsed.
    const wallBefore = b.wallH
    await page.setViewportSize({ width: W - 15, height: 1000 })
    await page.mouse.move(Math.round((W - 15) / 2), 400)
    await page.waitForTimeout(700)
    const afterNudge = await collect(page)
    const wallStable = Math.abs(afterNudge.wallH - wallBefore) < wallBefore * 0.4 && afterNudge.wallH > 1000
    if (!wallStable) anyFail = true

    const clipped = b.tiles.filter((t) => t.clipX > 1 || t.clipY > 1)
    const moved = b.tiles.filter((t) => {
      const o = a.tiles.find((z) => z.id === t.id)
      return o && (Math.abs(o.x - t.x) > 20 || Math.abs(o.y - t.y) > 20)
    })
    const dead = +(1 - b.tileArea / (b.wallW * b.wallH)).toFixed(3)
    const skills = b.tiles.filter((t) => SKILL_IDS.includes(t.id))
    const skStray = strays(skills)
    const skW = [...new Set(skills.map((t) => t.w))]
    const skH = [...new Set(skills.map((t) => t.h))]
    const skUniform = Math.max(...skW) - Math.min(...skW) <= 16 && Math.max(...skH) - Math.min(...skH) <= 16
    // Cluster compactness: bounding-box area vs the area members actually cover.
    // ~1.0 = a perfect tight block; higher = loose / spread / snaking.
    const skSum = skills.reduce((s, t) => s + t.w * t.h, 0)
    const skBox =
      (Math.max(...skills.map((t) => t.x + t.w)) - Math.min(...skills.map((t) => t.x))) *
      (Math.max(...skills.map((t) => t.y + t.h)) - Math.min(...skills.map((t) => t.y)))
    const skCompact = +(skBox / skSum).toFixed(2)
    const usedRight = Math.max(...b.tiles.map((t) => t.x + t.w))
    const usedLeft = Math.min(...b.tiles.map((t) => t.x))
    // Stranded pebble: a small low-priority tile sitting near the very bottom.
    const badge = b.tiles.find((t) => t.id === "status-badge")
    const badgeYFrac = badge ? +((badge.y + badge.h / 2) / b.wallH).toFixed(2) : 0

    const noClip = clipped.length === 0
    const noThrash = moved.length === 0
    const cohesive = skStray.length === 0 && skCompact <= 1.7
    const badgePlaced = badgeYFrac <= 0.85
    if (!noClip || !noThrash || !cohesive) anyFail = true

    console.log(`\n=== ${W} ===  wall ${b.wallW}×${b.wallH}  dead ${dead}`)
    console.log(`  no-clip      ${pass(noClip)}${noClip ? "" : "  " + clipped.map((t) => `${t.id}(x${t.clipX},y${t.clipY})`).join(" ")}`)
    console.log(`  stable       ${pass(noThrash)}${noThrash ? "" : "  moved: " + moved.map((t) => t.id).join(",")}`)
    console.log(`  skills       ${pass(cohesive)} compact=${skCompact} (≤1.7)${skUniform ? "" : " non-uniform"}${skStray.length ? " strays:" + skStray.join(",") : ""}`)
    console.log(`  badge        ${pass(badgePlaced)} y-frac=${badgeYFrac} (≤0.85 = not stranded at bottom)`)
    console.log(`  fill/centre  content x[${usedLeft}..${usedRight}]  margins L${usedLeft} R${W - usedRight}`)
    // scroll integrity: can the document scroll to the lowest tile?
    const scrollOk = b.docScrollH >= b.maxTileBottom - 8
    if (!scrollOk) anyFail = true
    console.log(`  scroll       ${pass(scrollOk && canScroll)} reach=${scrollReach.reached}/${scrollReach.max} docScrollH=${b.docScrollH} lowestTile=${b.maxTileBottom}`)
    console.log(`  wall-stable  ${pass(wallStable)} wallH ${wallBefore} → ${afterNudge.wallH} after width-nudge+mousemove`)
    // biggest empty vertical band (the "huge gap")
    const minY = Math.min(...b.tiles.map((t) => t.y))
    const mg = maxGap(b.tiles, minY, b.maxTileBottom, usedLeft, usedRight)
    const gapOk = mg.gap < 220
    if (!gapOk) anyFail = true
    console.log(`  max-gap      ${pass(gapOk)} ${mg.gap}px empty band at y=${mg.atY} (<220)`)

    if (VERBOSE) {
      console.table(b.tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, w: t.w, h: t.h })))
    }
    if (SHOTS) {
      await page.setViewportSize({ width: W, height: Math.min(b.wallH + 40, 4000) })
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${SHOTS}/bento-${W}.png` })
      console.log(`  screenshot   ${SHOTS}/bento-${W}.png`)
    }
    await page.close()
  }

  // determinism: same width, two cold loads → identical geometry.
  const detW = WIDTHS[Math.floor(WIDTHS.length / 2)]
  const load = async () => {
    const p = await browser.newPage({ viewport: { width: detW, height: 1000 } })
    await p.goto(URL, { waitUntil: "networkidle" })
    await p.waitForFunction(() => document.querySelector(".bento-container")?.dataset.ready === "yes", { timeout: 8000 })
    await p.waitForTimeout(300)
    const s = sig((await collect(p)).tiles)
    await p.close()
    return s
  }
  const deterministic = (await load()) === (await load())
  if (!deterministic) anyFail = true
  console.log(`\ndeterminism @${detW} (two loads identical)  ${pass(deterministic)}`)

  // PATH determinism: a fresh load at W must equal loading wide then resizing to
  // W (the fullscreen → reload → shrink bug). Same width ⇒ same layout, period.
  const cw = (page) => page.evaluate(() => document.querySelector(".bento-container").clientWidth)
  const pf = await browser.newPage({ viewport: { width: detW, height: 1000 } })
  await pf.goto(URL, { waitUntil: "networkidle" })
  await pf.waitForFunction(() => document.querySelector(".bento-container")?.dataset.ready === "yes", { timeout: 8000 })
  await pf.waitForTimeout(3000) // let any font-load recompute settle
  const freshTiles = (await collect(pf)).tiles
  const freshW = await cw(pf)
  await pf.close()
  const p = await browser.newPage({ viewport: { width: 2000, height: 1000 } })
  await p.goto(URL, { waitUntil: "networkidle" })
  await p.waitForFunction(() => document.querySelector(".bento-container")?.dataset.ready === "yes", { timeout: 8000 })
  await p.setViewportSize({ width: detW, height: 1000 })
  await p.waitForTimeout(6000) // recompute = debounce + best-of-N anneal (~1.4s)
  const resizedTiles = (await collect(p)).tiles
  const resizedW = await cw(p)
  await p.close()
  let maxDelta = 0
  for (const t of resizedTiles) {
    const o = freshTiles.find((z) => z.id === t.id)
    if (o) maxDelta = Math.max(maxDelta, Math.abs(o.x - t.x), Math.abs(o.y - t.y))
  }
  // Tolerance, not exact: catches a DIFFERENT layout (the old bug was ~1000px+)
  // while allowing sub-line content-measure jitter (~tens of px) that doesn't
  // change the arrangement.
  const pathDet = maxDelta < 50
  if (!pathDet) anyFail = true
  console.log(`path-determinism @${detW} (fresh==wide→resize)  ${pass(pathDet)} maxΔ=${maxDelta}px  widths fresh=${freshW} resized=${resizedW}`)
  if (!pathDet) {
    const diffs = resizedTiles
      .map((t) => {
        const o = freshTiles.find((z) => z.id === t.id)
        return { id: t.id, dx: o ? t.x - o.x : 0, dy: o ? t.y - o.y : 0, fw: o?.w, rw: t.w, fh: o?.h, rh: t.h }
      })
      .filter((d) => Math.abs(d.dx) > 8 || Math.abs(d.dy) > 8 || Math.abs((d.fw ?? 0) - d.rw) > 8)
    console.log("  differing tiles:", diffs.map((d) => `${d.id}(Δx${d.dx},Δy${d.dy},w${d.fw}→${d.rw})`).join("  "))
  }
} finally {
  await browser.close()
}

console.log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS")
process.exit(anyFail ? 1 : 0)
