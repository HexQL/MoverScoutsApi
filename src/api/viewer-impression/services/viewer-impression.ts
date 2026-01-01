/**
 * viewer-impression service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::viewer-impression.viewer-impression', ({ strapi }) => ({
  async submitViewerImpression({
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
  }) {
    // Check if player exists
    if (!playerId) {
      return { error: 'PLAYER_NOT_FOUND' };
    }

    let player;
    try {
      player = await strapi.entityService.findOne('api::player.player', playerId);
      if (!player) {
        return { error: 'PLAYER_NOT_FOUND' };
      }
    } catch (error) {
      return { error: 'PLAYER_NOT_FOUND' };
    }

    // Check if user already submitted for this player
    const existingSubmission = await strapi.entityService.findMany(
      'api::viewer-impression.viewer-impression',
      {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
          player: {
            id: playerId,
          },
        },
        limit: 1,
      }
    );

    if (existingSubmission && existingSubmission.length > 0) {
      return { error: 'ALREADY_SUBMITTED' };
    }

    // Create the viewer impression record
    const viewerImpression = await strapi.entityService.create(
      'api::viewer-impression.viewer-impression',
      {
        data: {
          player: playerId,
          users_permissions_user: user.id,
          overallScore: overallScore || 0,
          technicalSkills: technicalSkills || null,
          positioningAndVision: positioningAndVision || null,
          decisionMaking: decisionMaking || null,
          workRateAndIntensity: workRateAndIntensity || null,
          consistency: consistency || null,
          athleticism: athleticism || null,
          additionalNotes: additionalNotes || null,
        },
      }
    );

    // Update player's viewer impression count and average score
    // Get current values from player (handle both direct access and attributes)
    const playerData = (player as any).attributes || player;
    const currentCount = playerData.viewerImpressionsCount ?? 0;
    const currentAverage = parseFloat(playerData.averageViewerImpressionScore) || 0;
    const newScore = overallScore || 0;

    let newCount: number;
    let newAverage: number;

    if (currentCount === 0 || !currentCount) {
      // First impression: set count to 1 and average to the submitted score
      newCount = 1;
      newAverage = newScore;
    } else {
      // Calculate new average: (oldAverage * oldCount + newScore) / newCount
      newCount = currentCount + 1;
      newAverage = (currentAverage * currentCount + newScore) / newCount;
    }

    // Update the player record
    try {
      await strapi.entityService.update('api::player.player', playerId, {
        data: {
          viewerImpressionsCount: newCount,
          averageViewerImpressionScore: parseFloat(newAverage.toFixed(2)), // Ensure decimal format
        },
      });
    } catch (updateError) {
      console.error('Error updating player viewer impression stats:', updateError);
      // Continue even if update fails - the impression was already created
    }

    // Return the response with authenticated user info, player found status, and overallScore
    return {
      authenticatedUser: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      playerFound: true,
      overallScore: overallScore || null,
      viewerImpression,
    };
  },

  async checkImpressionSubmitted({ playerId, user }) {
    // Check if player exists
    if (!playerId) {
      return { error: 'PLAYER_NOT_FOUND', submitted: false, isUploader: false };
    }

    let player;
    try {
      // Populate uploadUser to check if the authenticated user is the uploader
      player = await strapi.entityService.findOne('api::player.player', playerId, {
        populate: ['uploadUser'],
      });
      if (!player) {
        return { error: 'PLAYER_NOT_FOUND', submitted: false, isUploader: false };
      }
    } catch (error) {
      return { error: 'PLAYER_NOT_FOUND', submitted: false, isUploader: false };
    }

    // Check if the authenticated user is the uploader
    const playerData = (player as any).attributes || player;
    const uploadUser = playerData.uploadUser;
    let isUploader = false;

    if (uploadUser) {
      // Handle different possible structures of uploadUser
      let uploadUserId: number | null = null;
      
      if (typeof uploadUser === 'object' && uploadUser !== null) {
        // Could be populated object with id, or nested structure
        uploadUserId = uploadUser.id || uploadUser.attributes?.id || uploadUser.data?.id || null;
      } else if (typeof uploadUser === 'number') {
        uploadUserId = uploadUser;
      }

      // Compare with authenticated user ID
      if (uploadUserId && uploadUserId === user.id) {
        isUploader = true;
      }
    }

    // Check if user has submitted for this player
    const existingSubmission = await strapi.entityService.findMany(
      'api::viewer-impression.viewer-impression',
      {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
          player: {
            id: playerId,
          },
        },
        limit: 1,
      }
    );

    const submitted = existingSubmission && existingSubmission.length > 0;

    return {
      authenticatedUser: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      playerFound: true,
      submitted,
      isUploader,
    };
  },

  async getUserSupportList({ user }) {
    // Fetch all viewer impressions by this user
    const userImpressions = await strapi.entityService.findMany(
      'api::viewer-impression.viewer-impression',
      {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        populate: {
          player: {
            populate: '*', // Populate all player fields including image1
          },
        },
      }
    );

    if (!userImpressions || userImpressions.length === 0) {
      return {
        supportList: [],
      };
    }

    // Format the data for the mini wide player cards
    const supportList = userImpressions.map((impression: any) => {
      const player = impression.player;
      const playerData = (player as any).attributes || player;
      
      // Get image URL from image1 - handle Strapi v5 structure
      let imageUrl = '/placeholder.svg';
      if (playerData.image1) {
        try {
          // Handle different Strapi response structures
          // Structure can be: image1.data.attributes.url or image1.attributes.url or image1.url
          let url = null;
          
          if (playerData.image1.data) {
            // Nested structure: image1.data.attributes.url
            url = playerData.image1.data.attributes?.url || playerData.image1.data.url;
          } else if (playerData.image1.attributes) {
            // Structure: image1.attributes.url
            url = playerData.image1.attributes.url;
          } else if (playerData.image1.url) {
            // Direct structure: image1.url
            url = playerData.image1.url;
          }
          
          if (url) {
            // If URL is already absolute (e.g., from S3), use it as-is
            if (url.startsWith('http')) {
              imageUrl = url;
            } else {
              // For relative URLs, return the path - frontend will prepend base URL
              imageUrl = url.startsWith('/') ? url : `/${url}`;
            }
          }
        } catch (error) {
          console.error('Error extracting image URL:', error);
          imageUrl = '/placeholder.svg';
        }
      }

      // Determine status color based on supportState
      const supportState = playerData.supportState || '';
      let statusColor: 'red' | 'green' | 'orange';
      let statusIcon: 'rejected' | 'accepted' | 'pending';

      if (supportState === 'Rejected by fans' || supportState === 'Rejected by club') {
        statusColor = 'red';
        statusIcon = 'rejected';
      } else if (supportState === 'Accepted') {
        statusColor = 'green';
        statusIcon = 'accepted';
      } else {
        statusColor = 'orange';
        statusIcon = 'pending';
      }

      return {
        playerId: playerData.id || player.id,
        playerName: playerData.name || '',
        playerSlug: playerData.slug || '',
        playerImage: imageUrl,
        playerPosition: playerData.position || '',
        playerClub: playerData.club || 'Free Agent',
        playerAge: playerData.age || 0,
        playerNationality: playerData.nationality || '',
        overallScore: impression.overallScore || 0,
        communityAverage: parseFloat(playerData.averageViewerImpressionScore) || 0,
        supportState: supportState,
        statusColor: statusColor,
        statusIcon: statusIcon,
        timestamp: impression.createdAt || impression.updatedAt,
      };
    });

    return {
      supportList,
    };
  },
}));
