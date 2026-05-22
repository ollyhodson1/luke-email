function nowLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-GB").format(new Date());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function allRequiredRecipientsSelected(selectedRecipients) {
  const selected = new Set(selectedRecipients.map((contact) => contact.id));
  return window.REQUIRED_CONTACTS.every((contact) => selected.has(contact.id));
}

function validateSend(compose) {
  if (!allRequiredRecipientsSelected(compose.to)) {
    return "Please add Luke’s Practice Supervisor, Practice Assessor, Academic Assessor and PEF / Link Nurse before sending.";
  }

  if (!compose.subject.trim()) {
    return "Please add a clear subject line so the concern is easy to identify and prioritise.";
  }

  if (!compose.body.trim()) {
    return "Please explain the concern before sending the email.";
  }

  if (countWords(compose.body) < 40) {
    return "The concern is not fully explained yet. Add more detail about what has happened, why it is serious, and who needs to be involved.";
  }

  return "";
}

function contactDisplay(contact) {
  return `${contact.name} <${contact.email}>`;
}
