/**
 * viewer-impression controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::viewer-impression.viewer-impression', ({ strapi }) => ({
  async submitViewerImpression(ctx) {
    try {
      const {
        playerId,
        overallScore,
        technicalSkills,
        positioningAndVision,
        decisionMaking,
        workRateAndIntensity,
        consistency,
        athleticism,
        additionalNotes,
      } = ctx.request.body;

      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to submit viewer impression');
      }

      // Check if user has voting permission
      // Fetch the full user data to ensure we have the canVote field
      const fullUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user' as any,
        user.id
      );

      if (!fullUser || fullUser.canVote !== true) {
        return ctx.forbidden('You do not have permission to vote');
      }

      // Call service to handle the submission logic
      const result = await strapi
        .service('api::viewer-impression.viewer-impression')
        .submitViewerImpression({
          playerId,
          overallScore,
          technicalSkills,
          positioningAndVision,
          decisionMaking,
          workRateAndIntensity,
          consistency,
          athleticism,
          additionalNotes,
          user,
        });

      // Check if service returned an error
      if (result.error) {
        if (result.error === 'PLAYER_NOT_FOUND') {
          return ctx.notFound('Player not found');
        }
        if (result.error === 'ALREADY_SUBMITTED') {
          return ctx.badRequest('You have already submitted a viewer impression for this player');
        }
      }

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },

  async checkImpressionSubmitted(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to check impression status');
      }

      // Get playerId from query params
      const { playerId } = ctx.query;

      if (!playerId) {
        return ctx.badRequest('playerId is required');
      }

      // Call service to check if impression exists
      const result = await strapi
        .service('api::viewer-impression.viewer-impression')
        .checkImpressionSubmitted({ playerId, user });

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },

  async getUserSupportList(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to get support list');
      }

      // Call service to get user's support list
      const result = await strapi
        .service('api::viewer-impression.viewer-impression')
        .getUserSupportList({ user });

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },
}));
