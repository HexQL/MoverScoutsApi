export default {
  routes: [
    {
      method: 'POST',
      path: '/registration-whitelists/register',
      handler: 'registration-whitelist.register',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/registration-whitelists/forgot-password',
      handler: 'registration-whitelist.forgotPassword',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public endpoint
      },
    },
    {
      method: 'POST',
      path: '/registration-whitelists/bulk-insert',
      handler: 'registration-whitelist.bulkInsert',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

