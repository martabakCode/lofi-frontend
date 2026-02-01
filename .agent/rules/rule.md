---
trigger: always_on
---

1. CORE UI PRINCIPLE (MANDATORY)
🔁 REUSABILITY FIRST

Agent WAJIB:

Mengutamakan Reusable Component

Mencegah duplikasi UI & logic

Mengabstraksi pola UI yang berulang

🚫 DILARANG:

Copy-paste markup antar feature

Inline styling per halaman

Membuat variasi kecil sebagai component baru tanpa alasan kuat

📌 Jika UI muncul ≥ 2 kali → HARUS reusable

2. TAILWIND AS SINGLE SOURCE OF STYLE
🎯 Styling Rule

Agent WAJIB:

Menggunakan Tailwind CSS utility

Menghindari CSS file baru kecuali:

Design token

Animation keyframes

HIG override global

🚫 DILARANG:

Inline style=""

CSS scoped di component untuk layout

Hardcode warna / spacing di CSS

3. CUSTOM COMPONENT RULE (STRICT)
✅ BOLEH membuat component baru JIKA:

Component bersifat reusable

Digunakan minimal 2 feature

Mengikuti Apple HIG

Styling 100% Tailwind

❌ TIDAK BOLEH:

Custom component dengan CSS manual

Custom component tanpa state isolation

Component dengan class hardcoded non-token

📌 Semua component baru:

✔ Standalone
✔ OnPush
✔ Tailwind-only
✔ Token-based

4. COMPONENT CLASSIFICATION (WAJIB)

Agent harus mengklasifikasikan component:

4.1 Primitive Components

Contoh:

Button

Input

Badge

Icon

Spinner

➡️ Lokasi: shared/components/primitives

4.2 Composite Components

Contoh:

Card

Modal

Toast

Dropdown

➡️ Lokasi: shared/components/composites

4.3 Layout Components

Contoh:

AppHeader

Sidebar

PageShell

➡️ Lokasi: layout/

5. COMPONENT DESIGN RULE (APPLE HIG)

Agent WAJIB menerapkan:

Rounded ≥ rounded-xl

Touch target ≥ min-h-[44px]

Spacing konsisten (p-4, gap-4)

Motion halus (150–300ms)

Contoh Tailwind:

<button
  class="
    min-h-[44px]
    px-4 py-2
    rounded-xl
    bg-blue-500
    text-white
    font-semibold
    transition
    duration-200
    ease-in-out
    active:scale-95
  "
>

6. STATE HANDLING IN COMPONENT
Rule:

UI state → signal()

Input → @Input()

Output → @Output()

Side effect → effect()

🚫 Tidak boleh:

Logic berat di template

Subscribe manual di component UI

7. VARIANT SYSTEM (REQUIRED)

Semua reusable component HARUS support variant.

Contoh:

type ButtonVariant = 'primary' | 'secondary' | 'danger'


Tailwind mapping:

const VARIANT_CLASS = {
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  danger: 'bg-red-500 text-white'
}


🚫 Tidak boleh:

if/else class di template

Duplicate class per variant

8. ACCESSIBILITY RULES (NON-NEGOTIABLE)

Agent WAJIB:

aria-label untuk icon-only button

Keyboard navigable

Focus ring visible (focus:ring-2)

Kontras warna aman

🚫 DILARANG:

Disable focus

Hidden clickable div

9. ANIMATION RULE (GSAP + TAILWIND)

Agent:

Boleh pakai GSAP untuk complex motion

Simple motion → Tailwind transition

🚫 Tidak boleh:

Animation berlebihan

Motion tanpa respect prefers-reduced-motion

10. REVIEW CHECKLIST (AUTO-ENFORCED)

Sebelum agent submit code, WAJIB cek:

 Component reusable?

 Tailwind only?

 Apple HIG compliant?

 Accessible?

 No duplicate UI?

 Test tersedia?

Jika 1 saja gagal → REFUSE

11. FINAL ASSERTION

Antigravity Agent:

❌ Tidak akan membuat UI sekali pakai

❌ Tidak akan menulis CSS sembarangan

❌ Tidak akan melanggar HIG

Antigravity Agent:

✅ Reusable by default

✅ Tailwind-driven

✅ Design-system aware

✅ Production ready