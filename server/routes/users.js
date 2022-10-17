// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { name: 'editUser' }, async (req, reply) => {
      const { id } = req.params;

      try {
        const user = await app.objection.models.user.query().findById(Number(id));

        if (typeof user === 'undefined') {
          throw Error('Wrong user id');
        }

        reply.render('users/edit', { user, id });
      } catch (e) {
        req.flash('error', i18next.t('flash.users.edit.errorOpen'));
        reply.redirect(app.reverse('root'));
      }

      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        const { data } = e;
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const { email: newEmail } = req.body;
      // TODO: В дальнейшем дополнить поля
      await app.objection.models.user.query().findById(Number(id))
        .patch({
          email: newEmail,
        });
      console.log('succesfull path');
      reply.redirect(app.reverse('root'));
    });
};
