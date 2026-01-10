/**
 * player controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::player.player', ({ strapi }) => ({
  async find(ctx) {
    // Override the default find to ensure uploadUser is included in the response
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    
    // Fetch using entityService - omit fields to get all fields including uploadUser
    const entities = await strapi.entityService.findMany('api::player.player', {
      ...sanitizedQuery,
    });
    
    // Process entities to ensure uploadUser is included in the response
    const processedEntities = Array.isArray(entities) ? entities : [entities];
    const entitiesWithUploadUser = await Promise.all(processedEntities.map(async (entity: any) => {
      // Handle Strapi v5 structure
      const entityData = entity.attributes || entity;
      const entityId = entity.id || entityData.id;
      
      // Always fetch uploadUser ID directly from the database to ensure we get it
      let uploadUserId: number | null = null;
      
      try {
        // For oneToOne relations in Strapi, the foreign key is stored in the player table
        // Query using raw SQL to get the uploadUser ID directly
        const knex = strapi.db.connection;
        const result = await knex('players')
          .where('id', entityId)
          .select('upload_user_id')
          .first();
        
        if (result && result.upload_user_id) {
          uploadUserId = result.upload_user_id;
        } else {
          // Try alternative column name (Strapi might use different naming)
          const result2 = await knex('players')
            .where('id', entityId)
            .select('uploadUser')
            .first();
          
          if (result2 && result2.uploadUser) {
            uploadUserId = result2.uploadUser;
          }
        }
      } catch (err) {
        console.error('Error fetching uploadUser for player:', entityId, err);
        // Fallback: try entityService with populate
        try {
          const fullEntity = await strapi.entityService.findOne('api::player.player', entityId, {
            populate: ['uploadUser'],
          });
          if (fullEntity) {
            const fullEntityData = (fullEntity as any).attributes || fullEntity;
            if (fullEntityData.uploadUser) {
              if (typeof fullEntityData.uploadUser === 'object' && fullEntityData.uploadUser !== null) {
                uploadUserId = fullEntityData.uploadUser.id || null;
              } else if (typeof fullEntityData.uploadUser === 'number') {
                uploadUserId = fullEntityData.uploadUser;
              }
            }
          }
        } catch (err2) {
          console.error('Error in fallback fetch:', err2);
        }
      }
      
      // Build the response object ensuring uploadUser is included
      const responseItem = {
        id: entityId,
        attributes: {
          ...entityData,
          uploadUser: uploadUserId, // Explicitly set uploadUser to the ID
        }
      };
      
      return responseItem;
    }));
    
    const result = Array.isArray(entities) ? entitiesWithUploadUser : entitiesWithUploadUser[0];
    
    // Use transformResponse but the uploadUser should now be in the attributes
    return this.transformResponse(result, {});
  },

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

  async submitModeratorDecision(ctx) {
    try {
      // Get authenticated user
      const user = ctx.state.user;

      // Check if user is authenticated
      if (!user) {
        return ctx.unauthorized('User must be authenticated to submit moderator decision');
      }

      // Fetch full user data to check isModerator status
      const fullUser = await strapi.entityService.findOne(
        'plugin::users-permissions.user' as any,
        user.id
      );

      // Check if user is a moderator
      if (!fullUser || fullUser.isModerator !== true) {
        return ctx.forbidden('You do not have permission to submit moderator decisions');
      }

      // Get parameters from request body
      const { playerId, decision, changeRequestMessage } = ctx.request.body;

      // Validate required parameters
      if (!playerId) {
        return ctx.badRequest('Player ID is required');
      }

      if (!decision) {
        return ctx.badRequest('Decision is required');
      }

      // Validate decision value
      const validDecisions = ['Approve', 'Reject', 'Request Changes'];
      if (!validDecisions.includes(decision)) {
        return ctx.badRequest(`Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
      }

      // Check if player exists
      const player = await strapi.entityService.findOne('api::player.player', playerId);

      if (!player) {
        return ctx.notFound('Player not found');
      }

      const playerData = (player as any).attributes || player;
      // Allow moderator actions even if needsModeratorCheck is false (e.g., for previously rejected players)
      // The check is removed - moderators can always make decisions

      // Prepare update data based on decision
      let updateData: any = {
        needsModeratorCheck: false,
      };

      if (decision === 'Approve') {
        updateData.hidden = false;
        updateData.moderatorMessage = '';
        updateData.supportState = 'Voting active';
      } else if (decision === 'Reject') {
        updateData.hidden = true;
        updateData.moderatorMessage = changeRequestMessage || '';
        updateData.supportState = 'Rejected by moderator';
      } else if (decision === 'Request Changes') {
        updateData.hidden = true;
        updateData.moderatorMessage = changeRequestMessage || '';
        // Keep current supportState for Request Changes
      }

      // Update the player
      const updatedPlayer = await strapi.entityService.update('api::player.player', playerId, {
        data: updateData,
      });

      return ctx.send({
        success: true,
        message: `Player ${decision.toLowerCase()}d successfully`,
        player: updatedPlayer,
      });
    } catch (err) {
      return ctx.badRequest('Invalid request', { error: err.message });
    }
  },
}));
