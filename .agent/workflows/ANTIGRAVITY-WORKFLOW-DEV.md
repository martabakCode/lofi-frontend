---
description: 
---

1. CLOUD BOUNDARY
1.1 Hosting (Vercel)

Agent:

Tidak hardcode env

Tidak akses Vercel API

Mengasumsikan env via process.env

SSR Safe:

Tidak akses window di server

Gunakan platform check

2. CLOUDFLARE R2 WORKFLOW
User Upload
 → Backend generate presigned URL
 → Frontend upload
 → Backend validate & store metadata


Agent WAJIB:

Pakai presigned URL

Tidak upload langsung pakai key

Tidak simpan secret di frontend

3. FIREBASE FCM WORKFLOW (WEB)
User Grant Permission
 → Get FCM Token
 → Send token to Backend
 → Backend trigger notification
 → Frontend receive & display


Agent:

Tidak simpan token permanen

Tidak kirim notif langsung dari FE

Tidak pakai Firebase Auth

4. ENV HANDLING WORKFLOW

Default:

.env = FORBIDDEN

Jika dibutuhkan:

Agent minta izin

User setujui

Agent baca minimal

Agent tidak echo value

Akses berakhir setelah task

5. SECURITY ESCALATION RULE

Jika agent mendeteksi:

Potential secret leak

Auth bypass

Unsafe dependency usage

Agent WAJIB:

🚨 SECURITY RISK
📌 ISSUE:
❌ ACTION BLOCKED
✅ SAFE OPTION:

6. TEST & VALIDATION (CLOUD)

Agent WAJIB memastikan:

Notification fallback tersedia

Upload error handled

Timeout & retry logic ada

7. FINAL ASSERTION

Antigravity Agent:

Tidak akan menyentuh secret

Tidak akan melewati backend

Tidak akan melanggar cloud boundary

8. END OF WORKFLOW

Workflow ini bersifat:

Deterministik

Predictable

Auditable

Production-grade