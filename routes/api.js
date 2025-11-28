'use strict';

let issues = []

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project;
      const filter = req.query;

      let projectIssues = issues
        .filter(issue => issue.project === project)
        .filter(issue => {
          return Object.keys(filter).every(key => {
            return String(issue[key]) === String(filter[key]);
          });
        });
      res.json(projectIssues);
    })

    .post(function (req, res){
      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const now = new Date().toISOString();

      const newIssue = {
        _id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        project: project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: now,
        updated_on: now,
        open: true
      };
      issues.push(newIssue);
      res.json(newIssue);
    })

    .put(function (req, res){
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing id'});
      }

      const updateFields = req.body;
      delete updateFields._id;

      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'fields are empty', _id });
      }

      const issue = issues.find(i => i._id === _id);
      if (!issue) {
        return res.json({ error: 'issue was not found', _id });
      }

      Object.keys(updateFields).forEach(key => {
        if (key === 'open') {
          issue.open = updateFields.open !== 'false';
        } else {
          issue[key] = updateFields[key];
        }
      });

      issue.updated_on = new Date().toISOString();

      res.json({ result: 'issue successfully updated', _id });
    })

    .delete(function (req, res){
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing id' });
      }

      const index = issues.findIndex(i => i._id === _id);
      if (index === -1) {
        return res.json({ error: 'could not delete issue', _id });
      }

      issues.splice(index, 1);
      res.json({ result: 'issue successfully deleted', _id });
    });
};
