const state = {
  emails: [...window.INITIAL_EMAILS],
  activeFolder: "Inbox",
  selectedId: "continuity-becca-luke-contacted",
  query: "",
  showCompose: false,
  compose: { to: [], subject: "", body: "" },
  showPicker: false,
  toastTimer: null,
  replyTimer: null,
  simTime: new Date()
};

function showToast(message, duration = 3200) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.add("hidden"), duration);
}

function filteredEmails() {
  const term = state.query.trim().toLowerCase();

  return state.emails.filter((email) => {
    const matchesFolder = email.folder === state.activeFolder;
    const matchesSearch =
      !term ||
      email.sender.toLowerCase().includes(term) ||
      email.subject.toLowerCase().includes(term) ||
      email.body.join(" ").toLowerCase().includes(term) ||
      email.category.toLowerCase().includes(term);

    return matchesFolder && matchesSearch;
  });
}

function folderCounts() {
  return state.emails.reduce((acc, email) => {
    if (!acc[email.folder]) {
      acc[email.folder] = { total: 0, unread: 0 };
    }

    acc[email.folder].total += 1;

    if (email.unread) {
      acc[email.folder].unread += 1;
    }

    return acc;
  }, {});
}

function selectedEmail() {
  return state.emails.find((email) => email.id === state.selectedId) || filteredEmails()[0] || null;
}

function scrollReadingPaneToTop() {
  const pane = document.getElementById("readingPane");
  const panelBody = pane ? pane.querySelector(".panel-body") : null;

  if (panelBody) {
    panelBody.scrollTop = 0;
  }

  if (pane) {
    pane.scrollTop = 0;
  }
}

function displayNowLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(state.simTime || new Date());
}

function displayTodayLabel() {
  return new Intl.DateTimeFormat("en-GB").format(state.simTime || new Date());
}

function addMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function animateTimeAdvance(minutes, callback) {
  const overlay = document.getElementById("timeOverlay");
  const bigClock = document.getElementById("bigClock");
  const start = new Date(state.simTime || new Date());
  const steps = Math.max(10, Math.min(30, minutes));
  const stepMinutes = minutes / steps;
  let currentStep = 0;

  if (!overlay || !bigClock) {
    state.simTime = addMinutesToDate(start, minutes);
    updateClock();
    callback();
    return;
  }

  overlay.classList.remove("hidden");
  bigClock.textContent = displayNowLabel();

  const interval = window.setInterval(() => {
    currentStep += 1;
    state.simTime = addMinutesToDate(start, Math.round(stepMinutes * currentStep));
    bigClock.textContent = displayNowLabel();
    updateClock();

    if (currentStep >= steps) {
      window.clearInterval(interval);
      state.simTime = addMinutesToDate(start, minutes);
      bigClock.textContent = displayNowLabel();
      updateClock();

      window.setTimeout(() => {
        overlay.classList.add("hidden");
        callback();
      }, 450);
    }
  }, 85);
}

function renderFolders() {
  const folders = ["Inbox", "Sent Items", "Drafts", "Deleted Items"];
  const counts = folderCounts();

  document.getElementById("folders").innerHTML = folders.map((folder) => `
    <button class="folder-btn ${state.activeFolder === folder ? "active" : ""}" data-folder="${escapeHtml(folder)}">
      <span>${escapeHtml(folder)}</span>
      ${
        counts[folder]
          ? `<span class="${counts[folder].unread ? "count unread-count" : "count"}">${
              counts[folder].unread || counts[folder].total
            }</span>`
          : ""
      }
    </button>
  `).join("");

  document.querySelectorAll("[data-folder]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeFolder = btn.dataset.folder;
      const first = state.emails.find((email) => email.folder === state.activeFolder);
      state.selectedId = first ? first.id : "";
      state.showCompose = false;
      render();
    });
  });
}

function renderMessageList() {
  const list = filteredEmails();
  const current = selectedEmail();

  document.getElementById("folderTitle").textContent = state.activeFolder;
  document.getElementById("folderTotal").textContent = `${list.length} total`;

  document.getElementById("messageList").innerHTML = list.length
    ? list.map((email) => `
      <button class="message-card ${current?.id === email.id && !state.showCompose ? "active" : ""}" data-email="${escapeHtml(email.id)}">
        <div class="msg-top">
          <div style="min-width:0;">
            <div class="msg-subject-row">
              ${email.unread ? `<span class="unread-dot"></span>` : ""}
              <div class="msg-subject ${email.unread ? "unread-text" : ""}">${escapeHtml(email.subject)}</div>
            </div>
            <div class="msg-sender">${escapeHtml(email.sender)}</div>
          </div>
          <div class="msg-time">${escapeHtml(email.time)}</div>
        </div>
        <div class="msg-snippet">${escapeHtml(email.body[0] || "")}</div>
        <span class="tag">${escapeHtml(email.category)}</span>
      </button>
    `).join("")
    : `<div class="message-card"><span class="msg-sender">No emails found.</span></div>`;

  document.querySelectorAll("[data-email]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.email;

      const email = state.emails.find((item) => item.id === state.selectedId);
      if (email) {
        email.unread = false;
      }

      state.showCompose = false;
      render();
    });
  });
}

function renderEmailPanel() {
  const email = selectedEmail();
  const pane = document.getElementById("readingPane");

  if (!email) {
    pane.innerHTML = `<div class="panel"><div class="panel-body">Select a folder or email.</div></div>`;
    return;
  }

  const body = email.body.map((paragraph) => {
    if (email.code && paragraph.includes(email.code)) {
      return `<p class="code-line">Blackboard code: <strong>${escapeHtml(email.code)}</strong></p>`;
    }

    return `<p>${escapeHtml(paragraph)}</p>`;
  }).join("");

  pane.innerHTML = `
    <article class="panel">
      <div class="panel-head">
        <div style="min-width:0;">
          <h1 class="panel-title">${escapeHtml(email.subject)}</h1>
          <div class="panel-sub">${email.dateGroup === email.time ? escapeHtml(email.dateGroup) : `${escapeHtml(email.dateGroup)} · ${escapeHtml(email.time)}`}</div>
        </div>
        <div class="panel-actions">
          <button id="replyBtn" class="btn btn-primary">↩ Reply</button>
          <button id="starBtn" class="btn">☆</button>
          <button id="deleteBtn" class="btn">🗑</button>
        </div>
      </div>

      <div class="panel-body">
        <div class="sender-row">
          <div class="avatar">${escapeHtml(email.initials)}</div>
          <div style="min-width:0; flex:1;">
            <div><strong>${escapeHtml(email.sender)}</strong> <span class="tiny">to: ${escapeHtml(email.to)}</span></div>
            <div class="email-text">${body}</div>
          </div>
        </div>
      </div>

      <div class="compose-foot">
        <span class="tiny">Training mailbox · ${escapeHtml(state.activeFolder)}</span>
        <span class="tiny">${filteredEmails().length} message${filteredEmails().length === 1 ? "" : "s"}</span>
      </div>
    </article>
  `;

  scrollReadingPaneToTop();

  document.getElementById("replyBtn").addEventListener("click", () => {
    state.compose = {
      to: [],
      subject: email.subject.startsWith("RE:") ? email.subject : `RE: ${email.subject}`,
      body: ""
    };
    state.showCompose = true;
    state.showPicker = false;
    render();
  });

  document.getElementById("starBtn").addEventListener("click", () => {
    email.starred = !email.starred;
    render();
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    const list = filteredEmails();
    const next = list.find((item) => item.id !== email.id);

    email.folder = "Deleted Items";
    state.selectedId = next ? next.id : "";
    showToast("Email moved to Deleted Items");
    render();
  });
}

function contactChips() {
  if (!state.compose.to.length) {
    return `<span class="tiny">Click here to add recipients</span>`;
  }

  return `
    <div class="chips">
      ${state.compose.to.map((contact) => `
        <span class="chip">${escapeHtml(contact.name)}<small>${escapeHtml(contact.email)}</small></span>
      `).join("")}
    </div>
  `;
}

function recipientsGuideHtml() {
  if (allRequiredRecipientsSelected(state.compose.to)) {
    return "";
  }

  return `
    <div class="guide">
      ℹ️ You need to add Luke’s Practice Assessor, named Practice Supervisor, PEF / Link Nurse
      and Academic Assessor. The names were on his PARE document, but they should appear if you
      click here. Add all four to the email.
    </div>
  `;
}

function subjectGuideHtml() {
  if (!allRequiredRecipientsSelected(state.compose.to) || state.compose.subject.trim()) {
    return "";
  }

  return `
    <div class="guide">
      ℹ️ Add a clear subject that shows the importance of the concern. It should be obvious that
      this relates to Luke Pale, practice concerns and the timesheet issue.
    </div>
  `;
}

function bodyGuideHtml() {
  if (!allRequiredRecipientsSelected(state.compose.to) || !state.compose.subject.trim()) {
    return "";
  }

  return `
    <div class="guide bottom">
      ℹ️ Explain what you found, why it is serious, and why it needs escalating. Include the poor
      practice concern, the false timesheet entry, that the shift was not attended, and that the
      concern needs to be reviewed by practice and academic staff. Once this is a full explanation,
      click Send.
    </div>
  `;
}

function pickerHtml() {
  if (!state.showPicker) {
    return "";
  }

  const selected = new Set(state.compose.to.map((contact) => contact.id));

  return `
    <div class="picker">
      ${window.REQUIRED_CONTACTS.map((contact) => `
        <button class="contact ${selected.has(contact.id) ? "selected" : ""}" data-contact="${escapeHtml(contact.id)}">
          <span>
            <span class="contact-name">${escapeHtml(contact.name)}</span>
            <span class="contact-role">${escapeHtml(contact.role)}</span>
            <span class="contact-email">${escapeHtml(contact.email)}</span>
          </span>
          <span class="checkbox"></span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderComposePanel() {
  const pane = document.getElementById("readingPane");

  pane.innerHTML = `
    <section class="panel">
      <div class="panel-head compose-head">
        <div>
          <h1 class="panel-title">New message</h1>
          <div class="panel-sub">Escalate the concern about Luke Pale</div>
        </div>
        <button id="closeCompose" class="btn">✕</button>
      </div>

      <div class="panel-body">
        <div class="form-area">
          <div class="field-shell">
            <label>To</label>
            <button id="toButton" class="to-button" type="button">${contactChips()}</button>
            ${recipientsGuideHtml()}
            ${pickerHtml()}
          </div>

          <div class="field-shell">
            <label>Subject</label>
            <input id="subjectInput" class="input" value="${escapeHtml(state.compose.subject)}" placeholder="Enter subject" />
            ${subjectGuideHtml()}
          </div>

          <div class="field-shell">
            <label>Message</label>
            <textarea id="bodyInput" class="textarea" placeholder="Type the email here...">${escapeHtml(state.compose.body)}</textarea>
            ${bodyGuideHtml()}
          </div>
        </div>
      </div>

      <div class="compose-foot">
        <span class="tiny">Messages stay within this training app.</span>
        <div style="display:flex; gap:8px;">
          <button id="saveDraft" class="btn">Save draft</button>
          <button id="sendMail" class="btn btn-dark">Send</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("closeCompose").addEventListener("click", () => {
    state.showCompose = false;
    state.compose = { to: [], subject: "", body: "" };
    render();
  });

  document.getElementById("toButton").addEventListener("click", () => {
    state.showPicker = !state.showPicker;
    render();
  });

  document.querySelectorAll("[data-contact]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const contact = window.REQUIRED_CONTACTS.find((item) => item.id === btn.dataset.contact);
      const exists = state.compose.to.some((item) => item.id === contact.id);

      state.compose.to = exists
        ? state.compose.to.filter((item) => item.id !== contact.id)
        : [...state.compose.to, contact];

      render();
    });
  });

  document.getElementById("subjectInput").addEventListener("input", (event) => {
    state.compose.subject = event.target.value;
  });

  document.getElementById("subjectInput").addEventListener("blur", (event) => {
    state.compose.subject = event.target.value;
    render();
  });

  document.getElementById("bodyInput").addEventListener("input", (event) => {
    state.compose.body = event.target.value;
  });

  document.getElementById("bodyInput").addEventListener("blur", (event) => {
    state.compose.body = event.target.value;
  });

  document.getElementById("saveDraft").addEventListener("click", () => {
    const hasContent = state.compose.to.length || state.compose.subject.trim() || state.compose.body.trim();

    if (!hasContent) {
      showToast("There is nothing to save as a draft yet.");
      return;
    }

    const draft = {
      id: `draft-${Date.now()}`,
      folder: "Drafts",
      sender: "You",
      initials: "Y",
      to: state.compose.to.length ? state.compose.to.map(contactDisplay).join("; ") : "No recipient",
      subject: state.compose.subject.trim() || "No subject",
      dateGroup: "Today",
      time: displayNowLabel(),
      unread: false,
      starred: false,
      category: "Draft",
      body: [state.compose.body.trim() || "No message content"],
      attachments: []
    };

    state.emails.unshift(draft);
    state.activeFolder = "Drafts";
    state.selectedId = draft.id;
    state.showCompose = false;
    state.compose = { to: [], subject: "", body: "" };
    showToast("Draft saved");
    render();
  });

  document.getElementById("sendMail").addEventListener("click", sendMail);
}

function sendMail() {
  const validationMessage = validateSend(state.compose);

  if (validationMessage) {
    showToast(validationMessage, 4500);
    return;
  }

  const sent = {
    id: `sent-${Date.now()}`,
    folder: "Sent Items",
    sender: "You",
    initials: "Y",
    to: state.compose.to.map(contactDisplay).join("; "),
    subject: state.compose.subject.trim(),
    dateGroup: "Today",
    time: displayNowLabel(),
    unread: false,
    starred: false,
    category: "Student task",
    body: [state.compose.body.trim()],
    attachments: []
  };

  const previousFolder = state.activeFolder;
  const previousSelectedId = state.selectedId;

  state.emails.unshift(sent);
  state.activeFolder = previousFolder;
  state.selectedId = previousSelectedId;
  state.showCompose = false;
  state.compose = { to: [], subject: "", body: "" };

  showToast("Email sent. Time will move forward while you wait for a reply.", 3200);
  render();

  clearTimeout(state.replyTimer);
  state.replyTimer = window.setTimeout(() => {
    animateTimeAdvance(20, () => {
      const reply = createAcademicAssessorReply(sent.subject);

      state.emails.unshift(reply);
      state.activeFolder = previousFolder;
      state.selectedId = previousSelectedId;

      showToast("New unread reply received from Becca Richardson.", 4200);
      render();
    });
  }, 900);
}

function createAcademicAssessorReply(subject) {
  return {
    id: `reply-${Date.now()}`,
    folder: "Inbox",
    sender: "Becca Richardson",
    initials: "BR",
    to: "You; Jake Pegg <jake.pegg@salford.example>; Daniel Vaughan-Davies <daniel.vaughan-davies@salford.example>; Chris Doogan <chris.doogan@salford.example>",
    subject: subject.startsWith("RE:") ? subject : `RE: ${subject}`,
    dateGroup: "Today",
    time: displayNowLabel(),
    unread: true,
    starred: false,
    category: "Reply",
    code: "3086",
    body: [
      "Hello,",
      "Thank you for raising this concern and for escalating it appropriately.",
      "Given the concern relates to both poor practice and a false timesheet entry, we will need to arrange a meeting involving the Practice Assessor, named Practice Supervisor, PEF / Link Nurse and Academic Assessor.",
      "This is not the first time a concern has been raised. Jake had to put an action plan in place a few weeks ago, so we will need to review the previous concerns alongside this new information.",
      "There may be a need to consider Fitness to Practise. Fitness to Practise is the university process used when there are concerns that a student’s conduct, professionalism, honesty, health, or ability to practise safely may affect their suitability to continue on a professional programme. It does not automatically mean a student will be removed from the course, but it does mean the concern needs to be formally reviewed and managed.",
      "Thank you for raising this though. I am sure you will be part of any meetings when you come onto campus later this week, but for now, here is your code to put on Blackboard, under Part 2 of activity.",
      "Blackboard code: 3086",
      "You can close this page now and return to Blackboard.",
      "Kind regards,",
      "Becca Richardson",
      "Academic Assessor"
    ],
    attachments: []
  };
}

function openCompose() {
  state.compose = { to: [], subject: "", body: "" };
  state.showCompose = true;
  state.showPicker = false;
  render();
}

function render() {
  renderFolders();
  renderMessageList();

  if (state.showCompose) {
    renderComposePanel();
  } else {
    renderEmailPanel();
  }
}

function updateClock() {
  document.getElementById("clock").innerHTML = `${displayNowLabel()}<br>${displayTodayLabel()}`;
}

document.getElementById("introClose").addEventListener("click", () => {
  document.getElementById("introModal").classList.add("hidden");
});

document.getElementById("topNewMail").addEventListener("click", openCompose);
document.getElementById("sideNewMail").addEventListener("click", openCompose);

document.getElementById("searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

updateClock();
setInterval(updateClock, 30000);

console.assert(window.INITIAL_EMAILS.every((email) => email.unread === false), "Initial mailbox should not contain unread emails.");
console.assert(window.INITIAL_EMAILS[0].subject === "PS role", "PS role email should appear first.");
console.assert(window.INITIAL_EMAILS[0].sender === "Chris Doogan", "PS role email should be from Chris Doogan.");
console.assert(window.REQUIRED_CONTACTS.every((contact) => contact.email.endsWith("@salford.example")), "All training emails should use salford.example.");
console.assert(createAcademicAssessorReply("Test").unread === true, "Becca reply should arrive unread.");
console.assert(folderCounts().Inbox.total >= 6, "Inbox should have the expected starting emails.");
console.assert(folderCounts().Inbox.unread === 0, "Initial Inbox unread count should be zero.");
console.assert(folderCounts().Inbox.total === 6, "Initial inbox total should be six.");
console.assert(folderCounts().Inbox.unread === 0, "Initial inbox unread count should be zero.");

render();

console.assert(window.INITIAL_EMAILS.some((email) => email.id === "continuity-becca-luke-contacted") && window.INITIAL_EMAILS.some((email) => email.id === "continuity-pef-acknowledgement"), "Continuity emails should be present from the start.");

console.assert(typeof animateTimeAdvance === "function", "Clock animation overlay should exist.");
