# Simulated Email App

This is a GitHub-ready version of the Luke Pale escalation email simulation.

## How to put this on GitHub Pages

1. Unzip this file.
2. Upload the whole folder contents to a GitHub repository.
3. Go to `Settings` → `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select:
   - Branch: `main`
   - Folder: `/docs`
6. Save.

GitHub will give you the link after it deploys.

## Files

- `docs/index.html` — the page GitHub Pages opens
- `docs/styles.css` — styling
- `docs/data.js` — emails and contact names/emails
- `docs/helpers.js` — validation and helper functions
- `docs/app.js` — app behaviour

## Current simulation behaviour

- PS role email is from Chris Doogan.
- Training email addresses follow `firstname.lastname@salford.example`.
- No unread emails are shown initially.
- Initial instruction pop-up appears on opening.
- New Mail opens in the right-hand reading pane.
- Students are guided through To, Subject and Message.
- Required contacts:
  - Jake Pegg <jake.pegg@salford.example>
  - Daniel Vaughan-Davies <daniel.vaughan-davies@salford.example>
  - Becca Richardson <becca.richardson@salford.example>
  - Chris Doogan <chris.doogan@salford.example>
- Send is blocked if the concern is not fully explained.
- After a valid send, a reply from Becca Richardson arrives after 20 seconds.
- The Blackboard code is **3086**.
