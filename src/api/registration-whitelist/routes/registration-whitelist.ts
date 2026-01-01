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
  ],
};

