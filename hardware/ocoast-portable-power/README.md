# 0-Coast Portable Power Rig

Untether the Make Noise 0-Coast and run it off the same USB-C power bank that
feeds the OP-XY. One battery, two synths, zero wall warts.

## Why this works

The 0-Coast wants **15V DC, center-positive, 5.5 × 2.1 mm barrel**. Verified
from the stock adapter's label (CUI Inc SMI18-15): output **15.0V ⎓ 1.3A,
19.5W max**, center-positive per the polarity symbol; the unit itself draws
well under that ceiling. USB-C Power
Delivery happens to define **15V as a standard voltage rung** (the 15V @ 3A
profile in 45W+ chargers). So a PD power bank plus a "PD trigger" cable that
negotiates a fixed 15V gives you exactly the voltage the 0-Coast was designed
for — no boost converter hackery, no regulation stack, no noise-prone DIY
electronics.

The OP-XY itself **cannot** be the power source: its USB-C port is a charging
input / MIDI device port, not a PD source. The rig is:

```
USB-C PD power bank (45W+, dual port)
 ├── Port 1 ── 15V PD trigger cable ── 5.5×2.1mm center-positive ──▶ 0-Coast
 └── Port 2 ── plain USB-C cable ─────────────────────────────────▶ OP-XY
```

## Bill of materials

| # | Part | Spec that matters | Notes |
|---|------|-------------------|-------|
| 1 | USB-C PD power bank | **Must list 15V in its PD output profiles** (e.g. 5V/9V/12V/**15V**/20V), 45W+, ideally two ports with independent regulation | A 20,000 mAh bank runs the 0-Coast (~4W) for a full day of jamming |
| 2 | USB-C PD trigger cable, **fixed 15V**, 5.5 × 2.1 mm barrel, **center-positive** | Fixed 15V — not adjustable, not 20V | Sold as "PD trigger / decoy cable 15V 5525". Fixed beats adjustable: nothing to bump to a synth-killing voltage |
| 3 | USB-C cable for the OP-XY | Any decent one | You already own this |
| 4 | Adhesive velcro or 20 mm velcro straps | — | Mounts the printed caddy; keeps everything strapped in transit |
| 5 | (Optional) cheap multimeter | — | For the one-time polarity check below. Non-negotiable if you skip nothing else |

## Safety checklist — do these in order, once

1. **Confirm the bank speaks 15V.** Read the output spec printed on the bank.
   If 15V is not listed, the trigger cable can't negotiate it — most cables
   then fall back to 5V (0-Coast just won't wake up; harmless but confusing).
   No 15V profile = wrong bank.
2. **Confirm the trigger is fixed 15V.** Never use a 20V trigger and never
   leave an adjustable trigger in the loop. 20V into a 15V input is how
   synths become paperweights.
3. **Meter the plug before it ever touches the 0-Coast.** Plug the trigger
   into the bank, set the multimeter to DC volts, probe the barrel:
   **center pin must read +15V relative to the sleeve** (positive number with
   red probe on the pin). Expect 14.5–15.3V. Anything else — 5V, 20V, or a
   negative reading (reversed polarity) — stop and replace the cable.
4. **First power-up with nothing patched.** Plug into the 0-Coast, confirm it
   boots and behaves, then patch normally.
5. **Current is a non-issue.** The 15V PD rung supplies up to 3A; the 0-Coast
   draws a fraction of that. Headroom is enormous.

## Gotchas worth knowing

- **Port renegotiation brownouts.** Cheaper dual-port banks share one power
  stage: plugging a second device in mid-session renegotiates *both* ports
  and can hard-reset the 0-Coast (pop through your speakers included). Either
  buy a bank with independently regulated ports, or connect everything
  *before* you start playing.
- **Auto-sleep.** Some banks shut off under light load. The 0-Coast's ~4W
  draw keeps almost every bank awake, but if yours sleeps, that's the cause —
  look for a bank with an "always-on" / trickle mode.
- **Noise floor.** A quality bank is silent in the audio path — often quieter
  than a wall wart, since there's no mains hum to couple in. If you hear
  whine from a bargain-bin bank, the bank is the culprit, not the concept.
- **Strain relief matters.** Barrel jacks die from cable leverage, not from
  use. The printed caddy below exists mostly to solve this.

## The 3D print: power caddy

`power_caddy.scad` is a parametric sled for the power bank that parks behind
the 0-Coast:

- Open-top sleeve sized to your bank (three numbers at the top of the file)
- Cable exit slot plus an external strain-relief comb — loop the trigger
  cable through it so a yanked cable tugs the caddy, never the 0-Coast's jack
- Two through-slots in the base for velcro straps (lash the bank in for
  backpack transport) and a flat bottom for adhesive velcro to the desk or
  the 0-Coast's rear panel area

### Customize and render

1. Open `power_caddy.scad` in [OpenSCAD](https://openscad.org) (or the
   browser playground at ochafik.com/openscad).
2. Set `bank_w`, `bank_d`, `bank_h` to your power bank's measurements in mm.
   The default fit clearance handles normal measuring error.
3. Render (F6) and export the STL.

### Print settings

| Setting | Value |
|---------|-------|
| Material | PETG preferred (a warm bank + a hot car is ABS/PETG territory; PLA works indoors) |
| Layer height | 0.2 mm |
| Perimeters | 3 |
| Infill | 15–20% |
| Supports | None — prints flat on its base |
| Orientation | Base down, as modeled |
