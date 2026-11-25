describe('Full-stack portfolio release', () => {
  let credentials;
  let adminToken;
  let userToken;
  let submissionId;
  const project = { title: 'Release demo project', completionDate: '2026-11-01', description: 'Created and verified in the final release test.' };

  before(() => {
    cy.task('credentials', null, { log: false }).then(value => { credentials = value; });
  });

  function signIn(email, password) {
    cy.visit('/signin');
    cy.get('input[name="email"]').type(email, { log: false });
    cy.get('input[name="password"]').type(password, { log: false });
    cy.contains('button', 'Sign in').click();
  }

  function api(method, path, token, body, status) {
    return cy.request({
      method, url: '/api/' + path, headers: token ? { Authorization: 'Bearer ' + token } : {},
      body, failOnStatusCode: false, log: false,
    }).then(response => { expect(response.status).to.eq(status); return response.body; });
  }

  it('registers a reader, rejects admin access, and preserves a public contact in MongoDB', () => {
    cy.visit('/signup');
    cy.get('input[name="name"]').type('Demo Reader');
    cy.get('input[name="email"]').type(credentials.userEmail, { log: false });
    cy.get('input[name="password"]').type(credentials.userPassword, { log: false });
    cy.contains('button', 'Sign up').click();
    cy.location('pathname').should('eq', '/records/projects');
    cy.contains('Account created').should('be.visible');
    cy.window({ log: false }).then(win => {
      const session = JSON.parse(win.sessionStorage.getItem('portfolio.session'));
      expect(session.user.role).to.eq('user');
      userToken = session.token;
    });
    api('GET', 'projects', null, undefined, 401);
    api('GET', 'projects', 'invalid-token', undefined, 401);
    cy.then(() => api('POST', 'projects', userToken, project, 403));
    cy.then(() => api('GET', 'contacts', userToken, undefined, 403));
    cy.visit('/admin/contacts');
    cy.location('pathname').should('eq', '/records/projects');
    cy.contains('button', 'Edit').should('not.exist');
    cy.screenshot('reader-read-only');
    cy.contains('button', 'Sign out').click();
    cy.window().then(win => expect(win.sessionStorage.getItem('portfolio.session')).to.eq(null));

    cy.visit('/contact');
    cy.get('[name="firstName"]').type('Demo');
    cy.get('[name="lastName"]').type('Release');
    cy.get('[name="phone"]').type('555-0100');
    cy.get('[name="email"]').type('trace@example.test');
    cy.get('[name="message"]').type('Final release contact trace');
    cy.intercept('POST', '/api/contact-submissions').as('submit');
    cy.contains('button', 'Send Message').click();
    cy.wait('@submit').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      submissionId = response.body.submissionId;
    });
    cy.contains('Message sent. Reference').should('be.visible');
    cy.screenshot('contact-submitted');
    cy.then(() => cy.task('savedContact', submissionId, { log: false })).then(saved => {
      expect(saved.message).to.eq('Final release contact trace');
      expect(saved.email).to.eq('trace@example.test');
      expect(saved._id).to.eq(submissionId);
    });
  });

  it('signs in an administrator, manages all three record types, and verifies persistence and read-only access', () => {
    signIn(credentials.adminEmail, credentials.adminPassword);
    cy.location('pathname').should('eq', '/admin/projects');
    cy.window({ log: false }).then(win => { adminToken = JSON.parse(win.sessionStorage.getItem('portfolio.session')).token; });
    cy.get('[name="title"]').type(project.title);
    cy.get('[name="completionDate"]').type(project.completionDate);
    cy.get('[name="description"]').type(project.description);
    cy.contains('button', 'Save record').click();
    cy.contains('Record created.').should('be.visible');
    cy.reload();
    cy.contains('h2', project.title).should('be.visible');
    cy.contains('article', project.title).within(() => cy.contains('button', 'Edit').click());
    cy.get('[name="description"]').clear().type('Updated in the browser.');
    cy.contains('button', 'Save record').click();
    cy.contains('Record updated.').should('be.visible');
    cy.screenshot('administrator-project-updated');

    cy.then(() => {
      api('POST', 'qualifications', adminToken, { ...project, title: 'Reader qualification' }, 201);
      api('GET', 'qualifications', userToken, undefined, 200);
      for (const resource of ['projects', 'qualifications', 'contacts']) {
        const data = resource === 'contacts'
          ? { firstName: 'Demo', lastName: 'API', email: 'api@example.test', message: 'API CRUD' }
          : { ...project, title: 'API ' + resource };
        api('POST', resource, adminToken, data, 201).then(record => {
          api('GET', resource + '/' + record._id, adminToken, undefined, 200);
          const changes = resource === 'contacts' ? { message: 'Updated through API' } : { description: 'Updated through API' };
          api('PUT', resource + '/' + record._id, adminToken, { ...data, ...changes }, 200);
          api('DELETE', resource + '/' + record._id, adminToken, undefined, 200);
          api('GET', resource + '/' + record._id, adminToken, undefined, 404);
        });
        api('POST', resource, userToken, data, 403);
        api('PUT', resource + '/000000000000000000000000', userToken, data, 403);
        api('DELETE', resource + '/000000000000000000000000', userToken, undefined, 403);
      }
      api('GET', 'contacts/' + submissionId, adminToken, undefined, 200).then(record => {
        expect(record.message).to.eq('Final release contact trace');
      });
    });

    cy.visit('/admin/qualifications');
    cy.get('[name="title"]').type('Release qualification');
    cy.get('[name="completionDate"]').type('2026-11-01');
    cy.get('[name="description"]').type('Browser qualification CRUD');
    cy.contains('button', 'Save record').click();
    cy.contains('Record created.').should('be.visible');
    cy.contains('article', 'Release qualification').within(() => cy.contains('button', 'Edit').click());
    cy.get('[name="description"]').clear().type('Edited qualification');
    cy.contains('button', 'Save record').click();
    cy.contains('Record updated.').should('be.visible');
    cy.contains('article', 'Release qualification').within(() => {
      cy.contains('button', 'Delete').click();
      cy.contains('button', 'Confirm delete').click();
    });
    cy.contains('Record deleted.').should('be.visible');

    cy.visit('/admin/contacts');
    cy.contains('Final release contact trace').should('be.visible');
    cy.get('[name="firstName"]').type('Demo');
    cy.get('[name="lastName"]').type('Managed');
    cy.get('[name="email"]').type('managed@example.test');
    cy.contains('button', 'Save record').click();
    cy.contains('Record created.').should('be.visible');
    cy.contains('article', 'Demo Managed').within(() => cy.contains('button', 'Edit').click());
    cy.get('[name="message"]').type('Edited saved contact');
    cy.contains('button', 'Save record').click();
    cy.contains('Record updated.').should('be.visible');
    cy.contains('article', 'Demo Managed').within(() => {
      cy.contains('button', 'Delete').click();
      cy.contains('button', 'Confirm delete').click();
    });
    cy.contains('Record deleted.').should('be.visible');
    cy.screenshot('administrator-contact-trace');
    cy.contains('button', 'Sign out').click();

    signIn(credentials.userEmail, credentials.userPassword);
    cy.location('pathname').should('eq', '/records/projects');
    cy.contains('h2', project.title).should('be.visible');
    cy.contains('button', 'Edit').should('not.exist');
    cy.screenshot('reader-saved-project');
    cy.contains('a', 'Qualifications').click();
    cy.contains('h2', 'Reader qualification').should('be.visible');
    cy.contains('button', 'Edit').should('not.exist');
    cy.contains('button', 'Sign out').click();
    signIn(credentials.adminEmail, credentials.adminPassword);
    cy.contains('article', project.title).within(() => {
      cy.contains('button', 'Delete').click();
      cy.contains('button', 'Confirm delete').click();
    });
    cy.contains('Record deleted.').should('be.visible');
    cy.contains('button', 'Sign out').click();
    cy.visit('/admin/projects');
    cy.location('pathname').should('eq', '/signin');
  });

  it('keeps mobile navigation and forms inside a 390px viewport', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.contains('a', 'Contact').first().click();
    cy.contains('h1', 'Contact Me').should('be.visible');
    cy.document().then(doc => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    cy.screenshot('mobile-contact');
  });
});
