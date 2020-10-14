const { getActivity } = require('./activities');

const CaseAuditController = CaseAudit => {
  const getContactIdsFromCaseAudits = caseAudits => {
    return [...new Set(caseAudits.map(caseAudit => caseAudit.newValue.contacts).flat())];
  };

  const getAuditsForCase = async caseId => {
    const queryObject = {
      order: [['createdAt', 'DESC']],
      where: {
        caseId,
      },
    };

    return CaseAudit.findAll(queryObject);
  };

  const getActivities = async (caseAudits, relatedContacts) => {
    const activities = [];

    caseAudits.forEach(caseAudit => {
      const activity = getActivity(caseAudit, relatedContacts);
      if (activity) activities.push(activity);
    });

    return activities;
  };

  return { getAuditsForCase, getActivities, getContactIdsFromCaseAudits };
};

module.exports = CaseAuditController;