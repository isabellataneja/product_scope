# Commure Ambient — UI & Design Context

Internal reference for **Commure Ambient Assist** (AI + human-in-the-loop scribe) and **Commure Ambient Live** (AI-only, specialty-focused).

## Visual language / vibe

- **Aesthetic:** Clean, modern healthcare app — **dark navy/blue** for active recording states; **light gray/white** for schedule and note views.
- **Imagery:** Heavy use of **mobile screenshots** (iPhone form factor) with **annotated callout boxes**.
- **Typography:** Bold sans-serif headers, clean body text, **minimal palette** — black, white, blue accents, **teal/cyan** for highlights.
- **Iconography:** Simple and functional; **status indicators** use colored dots/icons:
  - **Green checkmark** → Generated  
  - **Orange** → Paused  
  - **Blue cloud** → In EHR  
- **Tone:** Professional but approachable; copy is for **clinicians**, not engineers.

## App structure (nav tabs)

**Visits · My Scribes · Copilot/AI Studio · Inbox · Menu**

## Core UI flows

1. **Schedule** → select patient → **Start Visit** → **recording screen** (blue fullscreen, waveform, timer) → **End Visit** → note generated → **MDS icon** to send → **EHR upload**
2. **Post-visit:** **AI Actions** → **Smart Edit** → **Record Audio** → **Regenerate**
3. **Re-linking:** Menu → **View Linked Appointment** → **Change Appointment** → **Link Appointment**
4. **Auto-send:** Menu → **Preferences** → **Auto Send Notes to MDS** (Time of Day or Minutes modes)
5. **In-app chat (Inbox tab):** MDS ↔ clinician messaging per patient scribe; **red dot** for unread

## Terminology (preserve exactly)

| Term | Meaning |
|------|---------|
| **Scribe** | The generated / in-progress **note** (not the human) |
| **MDS** | Medical Documentation Specialist — human QA layer |
| **Copilot** | AI assistant tab |

### Statuses

`Processing` · `Generated` · `With MDS` · `In EHR` · `Paused` · `Unassigned` · `Error`

---

## Implementation in this repo

Design tokens live in `app/globals.css` (`:root` / `.dark`) and Tailwind theme extensions in `tailwind.config.ts` (`commure` color scale). Use these for new UI that should align with Commure Ambient.
