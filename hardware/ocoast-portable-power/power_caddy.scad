// ============================================================
// 0-Coast Portable Power Caddy
// Parametric sled for a USB-C PD power bank, parked behind a
// Make Noise 0-Coast. Prints flat, no supports.
//
// Set the three bank_* dimensions to YOUR power bank, render
// (F6), export STL. Everything else derives sensibly.
// ============================================================

/* ---------- measure your power bank (mm) ---------- */
bank_w = 150;   // longest side (lies left-right in the sled)
bank_d = 70;    // depth, front-to-back
bank_h = 26;    // thickness of the bank lying flat

/* ---------- fit and structure ---------- */
clearance   = 0.8;   // total slop around the bank; 0.8 suits FDM
wall        = 3;     // wall thickness
base_t      = 3;     // floor thickness
wall_frac   = 0.75;  // wall height as a fraction of bank_h (open top)
corner_r    = 4;     // outer corner radius

/* ---------- features ---------- */
thumb_r        = 14;   // front thumb-scoop radius (grab the bank out)
cable_slot_w   = 9;    // exit slot in the right wall for the barrel cable
velcro_w       = 22;   // velcro strap width (slot cut in the base)
velcro_slot_t  = 4;    // slot thickness for the strap to pass through
comb_slot_w    = 4.6;  // strain-relief comb: slot width, fits ~4 mm cable
comb_depth     = 14;   // how far the comb sticks out from the right wall

$fn = 48;

/* ---------- derived ---------- */
cav_w  = bank_w + clearance;
cav_d  = bank_d + clearance;
out_w  = cav_w + 2 * wall;
out_d  = cav_d + 2 * wall;
wall_h = max(10, bank_h * wall_frac);
out_h  = base_t + wall_h;

// XY-rounded box, centered in X/Y, sitting on Z=0
module rounded_box(w, d, h, r) {
    linear_extrude(h)
        offset(r = r) offset(r = -r)
            square([w, d], center = true);
}

module caddy_body() {
    difference() {
        rounded_box(out_w, out_d, out_h, corner_r);

        // bank cavity
        translate([0, 0, base_t])
            rounded_box(cav_w, cav_d, out_h, corner_r / 2);

        // front thumb scoop, centered on the front wall
        translate([0, -out_d / 2, base_t + wall_h + thumb_r * 0.4])
            rotate([-90, 0, 0])
                cylinder(r = thumb_r, h = wall * 3, center = true);

        // cable exit: vertical slot through the right wall, near the back
        translate([out_w / 2 - wall, out_d / 2 - wall - cable_slot_w * 1.5,
                   base_t])
            cube([wall * 2, cable_slot_w, out_h]);

        // two velcro slots through the base; one strap threads down
        // one slot and up the other, wrapping left-right over the bank
        for (x = [-out_w / 4, out_w / 4])
            translate([x - velcro_slot_t / 2, -velcro_w / 2, -1])
                cube([velcro_slot_t, velcro_w, base_t + 2]);
    }
}

// Strain-relief comb on the exterior right wall: weave the trigger
// cable through so a yank loads the caddy, not the 0-Coast's jack.
module strain_comb() {
    comb_w = comb_slot_w * 2 + 3 * wall;  // two slots, three teeth
    translate([out_w / 2, -comb_w / 2, 0])
        difference() {
            cube([comb_depth, comb_w, out_h]);
            for (i = [0, 1])
                translate([-1, wall + i * (comb_slot_w + wall),
                           base_t])
                    cube([comb_depth + 2, comb_slot_w, out_h]);
        }
}

caddy_body();
strain_comb();
