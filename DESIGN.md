# Last Light — Design

*A second pass at the concept and the design. This document is the reasoning;
the README is the pitch. Where they disagree, this wins.*

---

## 1. The one-line concept

> One sun for the whole planet, a timer counting down to the Long Night, and a
> village that can only keep the light alive by **waking each other up**.

It is a *cooperative idle-but-tense* game. There is no winning, only **how long
can we keep the light** — a high score measured in days the world stayed lit and
suns saved from the pack.

The folklore is load-bearing, not decoration. The Romanian *vârcolaci* legend
already contains the entire mechanic: when the wolves gnaw at the sun, you make
noise until they let go. Every design decision should be checkable against the
legend — if it isn't something a frightened village would do, it probably
doesn't belong.

---

## 2. Honest critique of the first version

What the first version got right:

- **The ritual feels good.** Hold-to-charge, release-in-the-arc is a clean,
  one-thumb skill expression with real audio feedback. Keep it untouched.
- **The cooldown's intent is correct.** Forcing recruitment ("your voice is
  hoarse — wake another villager") is the whole social engine.
- **Tone is consistent.** The copy, the SVG scene, and the synthesized din all
  pull in the same direction.

Where it was thin:

1. **The cooldown screen is dead air.** After your one din you wait 15 minutes
   with literally nothing to do or watch. The game asks you to recruit but gives
   you no live, in-the-moment reason that recruiting *now* matters more than
   recruiting later. Retention leaks out of this hole.
2. **Recruitment has no teeth in the moment.** Two villagers banging at the same
   second is worth exactly the same as two banging an hour apart. So "go wake
   the village" is an abstract good rather than an urgent, visible payoff.
3. **Progression is a flat reset.** A devoured sun drops into the graveyard and
   a fresh identical one is forged. Nothing escalates, nothing accrues. The
   graveyard is a list, not a saga, and the player has no identity that grows.
4. **The threat never actually bites.** The wolf creeps closer as light fails,
   but it never *does* anything — no teeth, no bite, no eclipse. The scariest
   beat (the jaws closing) is the most visually static.

The second pass fixes 1–4 with **one connective system plus two accruals**,
rather than a pile of unrelated features.

---

## 3. The connective idea: the village finds its rhythm

Add a single shared, live quantity: **momentum**.

- Every din (yours *or* another villager's) is a beat. When beats land close
  together — within a ~90-second window — the village builds momentum.
- Momentum has tiers: **calm → roused → roaring**. The higher the tier, the more
  each scare is worth (a multiplier on the minutes of light it buys).
- Momentum **decays**: stop banging and the rhythm fades back to calm.

Why this one addition does so much:

- **It fixes the dead cooldown (problem 1).** Momentum is a live gauge that
  moves on its own as villagers bang. Even while hoarse, you have something to
  watch, and a reason to stay on the page and rally.
- **It gives recruitment teeth (problem 2).** Getting three friends to bang in
  the same minute is now visibly, mathematically better than spreading them out.
  "Wake the village" becomes "wake the village *right now, together*." The share
  message can lean into this: *the village is roused — come pile on.*
- **It needs no new storage.** Momentum is *derived* from the din log we already
  keep. The shared world stays a single document; nothing new to sync when a
  real backend replaces `localStorage`.
- **It feeds the art and audio for free.** High momentum = brighter sun, the
  wolf shoved harder, a fuller din. One number drives loop, mood, and sound.

Tuning lives in `constants.ts` (`MOMENTUM_*`) so it can be balanced without
touching logic. Current values: 90s window; 2–3 recent beats = *roused* (×1.25);
4+ = *roaring* (×1.5).

---

## 4. Progression and stakes

Two things now accrue across play, one personal and one world-level.

**Personal — Warden titles.** Lifetime minutes of light you've personally won
map to a rank: *Villager → Bell-Ringer → Pot-Captain → Dawn-Warden → Keeper of
the Light*. It is pure recognition — no power, no pay-to-win — but it gives a
returning player an identity that grows, and a reason to come back to the same
device. Thresholds in `format.ts::wardenTitle`.

**World — the pack grows bolder.** Each new sun is forged from colder embers: it
is born with slightly *less* light than the last, floored so it never becomes
unwinnable. Sun I is born at 12h; each forge shaves 30 minutes, down to a 6h
floor. Now the graveyard reads as an escalating saga — *Sun XII fell to a
hungrier pack than Sun II ever faced* — and forging a new sun carries dread, not
just a reset. The legend supports this: the wolves are always hungry, and a
village that keeps losing suns is a village in decline.

These two pull against each other on purpose: the world gets harder while the
player gets prouder. That tension is the long-game.

---

## 5. Art, mood, and audio

- **The wolf bites.** As the jaws close (low light / critical), the maw grows a
  ring of teeth facing the sun and visibly overlaps its disc — the eclipse the
  legend is about. The scariest moment is now the most animated, not the least.
- **Momentum lights the scene.** Roused/roaring states brighten the sun and
  shove the wolf back harder than a single hold could, so a coordinated village
  *looks* like it's winning.
- **A new sun kindles.** Forging plays a one-shot glow bloom (`kindle`) so dawn
  feels like an event, not a state flip.
- **Dawn has a sound.** Forging triggers a bright rising arpeggio (`dawn()`),
  the tonal opposite of the dull `thud()` of a collapsed din.

All motion respects `prefers-reduced-motion`.

---

## 6. Deliberately deferred

- **Real multiplayer.** Still simulated (localStorage + phantom villagers). The
  whole design is written against a single shared document with a deadline and a
  din log, so the swap to a tiny realtime backend changes only
  `src/game/storage.ts`. Momentum, titles, and escalation all survive that swap
  untouched. *(Out of scope for this pass by request.)*
- **Anti-grief / rate limits.** A real backend needs server-side cooldown
  enforcement and a cap on momentum from any single source, or one script can
  fake a roaring village. Noted, not built.
- **Per-region suns / time zones.** "One planet, one sun" is the strongest
  version of the pitch; sharding it is a later scaling question, not a design
  one.

---

## 7. Open questions for the next pass

- Should momentum be **global** (one village) or **local to who you recruited**
  (your warband)? Global is simpler and matches "one planet"; local would make
  recruiting feel more personal. Leaning global.
- Does the 15-minute cooldown survive contact with momentum, or should being in
  a *roaring* village shorten your cooldown (rhythm carries you)? Tempting, but
  it weakens the recruitment engine. Holding for now.
- The graveyard is currently a quiet list. Should a long-lived sun earn a
  **name** (not just a numeral) it keeps in memoriam? Cheap, and good for
  attachment.
