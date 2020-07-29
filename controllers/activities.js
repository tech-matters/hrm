const ActivityTypes = {
  createCase: 'create',
  addNote: 'note',
  connectContact: {
    whatsapp: 'whatsapp',
    facebook: 'facebook',
    web: 'web',
    sms: 'sms',
  },
  unknown: 'unknown',
};

function createAddNoteActivity({ previousValue, newValue, createdAt }) {
  const previousNotes = (previousValue && previousValue.info && previousValue.info.notes) || [];
  const newNotes = (newValue && newValue.info && newValue.info.notes) || [];
  const newNote = newNotes.find(note => !previousNotes.includes(note));

  return {
    date: createdAt,
    type: ActivityTypes.addNote,
    text: newNote,
  };
}

function createConnectContactActivity(
  { previousValue, newValue, createdAt },
  type,
  relatedContacts,
) {
  const previousContacts = (previousValue && previousValue.contacts) || [];
  const newContacts = (newValue && newValue.contacts) || [];
  const newContactId = newContacts.find(contact => !previousContacts.includes(contact));
  const newContact = relatedContacts.find(contact => contact.id === newContactId);

  return {
    date: createdAt,
    type,
    text: newContact.rawJson.caseInformation.callSummary,
  };
}

function getActivityType({ previousValue, newValue }, relatedContacts) {
  const previousNotesCount =
    (previousValue &&
      previousValue.info &&
      previousValue.info.notes &&
      previousValue.info.notes.length) ||
    0;
  const newNotesCount =
    (newValue && newValue.info && newValue.info.notes && newValue.info.notes.length) || 0;
  const previousContacts = (previousValue && previousValue.contacts) || [];
  const newContacts = (newValue && newValue.contacts) || [];

  let activityType;

  if (!previousValue && newValue) {
    activityType = ActivityTypes.createCase;
  } else if (previousNotesCount < newNotesCount) {
    activityType = ActivityTypes.addNote;
  } else if (previousContacts.length < newContacts.length) {
    const newContactId = newContacts.find(contact => !previousContacts.includes(contact));
    const newContact = relatedContacts.find(contact => contact.id === newContactId);

    activityType = ActivityTypes.connectContact[newContact.channel];
  }

  return activityType;
}

function getActivity(caseAudit, relatedContacts) {
  const activityType = getActivityType(caseAudit, relatedContacts);
  let activity;

  if (activityType === ActivityTypes.addNote) {
    activity = createAddNoteActivity(caseAudit);
  } else if (Object.keys(ActivityTypes.connectContact).includes(activityType)) {
    activity = createConnectContactActivity(caseAudit, activityType, relatedContacts);
  }

  return activity;
}

module.exports = { getActivity };
