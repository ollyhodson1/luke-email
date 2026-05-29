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
- After a valid send, the screen stays where it is instead of opening Sent Items.
- After 20 seconds, a reply from Becca Richardson arrives as one unread Inbox message without opening automatically.
- The Blackboard code is **3086**.

## Continuity update v2

This version starts with the two wellbeing/non-attendance emails already present in the Inbox:
- Becca Richardson: contacted Luke and confirmed he had completed an absence form.
- Chris Doogan: PEF acknowledgement and request for Becca to contact Luke.

The app now opens on Becca Richardson’s continuity email so it is clear these have been added. All starting emails display as Yesterday.

## Clock-forward update

When students send the escalation email, the app now fades to a black clock screen and fast-forwards 20 minutes before Becca Richardson’s unread reply appears. The student no longer waits 20 seconds in real time.
