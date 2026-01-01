/**
 * player controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::player.player', ({ strapi }) => ({
  async getCommunityUploadedPlayersCount(ctx) {
    try {
      // This endpoint is accessible to authenticated users
      // No need to check authentication - it's just a count, safe to return
      const result = await strapi
        .service('api::player.player')
        .getCommunityUploadedPlayersCount();

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },

  async getUploadedPlayers(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to get uploaded players');
      }

      // Call service to get user's uploaded players
      const result = await strapi
        .service('api::player.player')
        .getUploadedPlayers({ user });

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },

  async editPlayerData(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to edit player data');
      }

      // Parse player data from FormData
      let playerData: any = {};
      let imageFile: any = null;
      let existingImage1Id: number | null = null;

      // Check if request has files (multipart/form-data)
      if (ctx.request.files && ctx.request.files.image1) {
        imageFile = ctx.request.files.image1;
      }

      // Parse JSON player data from form field
      if (ctx.request.body.playerData) {
        try {
          playerData = typeof ctx.request.body.playerData === 'string'
            ? JSON.parse(ctx.request.body.playerData)
            : ctx.request.body.playerData;
        } catch (e) {
          return ctx.badRequest('Invalid player data format');
        }
      } else {
        // Fallback: if no FormData, use request body directly (for backward compatibility)
        playerData = ctx.request.body;
      }

      // Get existing image ID if provided
      if (ctx.request.body.existingImage1Id) {
        existingImage1Id = parseInt(ctx.request.body.existingImage1Id, 10);
      }

      // Call service to create/update player
      const result = await strapi
        .service('api::player.player')
        .editPlayerData({ user, playerData, imageFile, existingImage1Id });

      // Check if service returned an error
      if (result.error) {
        if (result.error === 'PLAYER_NOT_FOUND') {
          return ctx.notFound('Player not found');
        }
        if (result.error === 'UNAUTHORIZED') {
          return ctx.forbidden('You are not authorized to edit this player');
        }
        if (result.error === 'IMAGE_UPLOAD_FAILED') {
          return ctx.badRequest('Image upload failed', { details: result.details });
        }
        if (result.error === 'NO_REMAINING_UPLOADS') {
          return ctx.forbidden('You have no remaining uploads. Please contact support to increase your upload limit.');
        }
        if (result.error === 'COMMUNITY_UPLOAD_LIMIT_REACHED') {
          return ctx.forbidden('The community upload limit of 20 players has been reached. No new players can be uploaded at this time.');
        }
      }

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },

  async deletePlayer(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to delete a player');
      }

      // Get player ID from query params, request body, or URL params
      const playerId = ctx.query?.id || ctx.request.body?.id || ctx.params?.id;

      if (!playerId) {
        return ctx.badRequest('Player ID is required');
      }

      // Call service to delete player
      const result = await strapi
        .service('api::player.player')
        .deletePlayer({ user, playerId });

      // Check if service returned an error
      if (result.error) {
        if (result.error === 'PLAYER_NOT_FOUND') {
          return ctx.notFound('Player not found');
        }
        if (result.error === 'UNAUTHORIZED') {
          return ctx.forbidden('You are not authorized to delete this player');
        }
        if (result.error === 'PLAYER_ID_REQUIRED') {
          return ctx.badRequest('Player ID is required');
        }
      }

      return ctx.send(result);
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },
}));
