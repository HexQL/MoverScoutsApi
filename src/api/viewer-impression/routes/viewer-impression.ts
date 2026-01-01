/**
 * viewer-impression router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/viewer-impressions/submit',
      handler: 'viewer-impression.submitViewerImpression',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/viewer-impressions/check',
      handler: 'viewer-impression.checkImpressionSubmitted',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/viewer-impressions/user-support-list',
      handler: 'viewer-impression.getUserSupportList',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
