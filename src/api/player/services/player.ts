/**
 * player service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::player.player', ({ strapi }) => ({
  async getCommunityUploadedPlayersCount() {
    // Count all players uploaded by users where isClubAdmin is false
    // First, get all players with uploadUser populated
    const allPlayers = await strapi.entityService.findMany('api::player.player', {
      populate: ['uploadUser'],
    });

    // Filter players where uploadUser exists and isClubAdmin is false
    const communityPlayers = allPlayers.filter((player: any) => {
      const playerData = (player as any).attributes || player;
      const uploadUser = playerData.uploadUser;
      
      // Check if uploadUser exists and isClubAdmin is false
      if (!uploadUser) return false;
      
      // Handle both populated object and ID reference
      const uploadUserData = uploadUser.attributes || uploadUser;
      const isClubAdmin = uploadUserData.isClubAdmin || uploadUser.isClubAdmin;
      
      return isClubAdmin === false;
    });

    return {
      count: communityPlayers.length,
    };
  },

  async getUploadedPlayers({ user }) {
    // Fetch all players where uploadUser equals the authenticated user
    const players = await strapi.entityService.findMany('api::player.player', {
      filters: {
        uploadUser: {
          id: user.id,
        },
      },
      populate: '*', // Populate all fields including relations and media
    });

    if (!players || players.length === 0) {
      return {
        players: [],
      };
    }

    // Return the full player data
    return {
      players: players.map((player: any) => {
        // Extract player data - handle Strapi v5 structure
        const playerData = (player as any).attributes || player;
        
        return {
          id: playerData.id || player.id,
          ...playerData,
        };
      }),
    };
  },

  async editPlayerData({ user, playerData, imageFile, existingImage1Id }) {
    const {
      id: playerId,
      slug,
      name,
      club,
      league,
      position,
      secondaryPosition,
      jerseyNumber,
      birthDate,
      age,
      heightCm,
      weightKg,
      foot,
      nationality,
      euStatus,
      youtubeVideoId,
      richTextMarkdown,
      smallInfoCard1Title,
      smallInfoCard1Content,
      smallInfoCard1Url,
      smallInfoCard1Highlighted,
      smallInfoCard2Title,
      smallInfoCard2Content,
      smallInfoCard2Url,
      smallInfoCard2Highlighted,
      smallInfoCard3Title,
      smallInfoCard3Content,
      smallInfoCard3Url,
      smallInfoCard3Highlighted,
      smallInfoCard4Title,
      smallInfoCard4Content,
      smallInfoCard4Url,
      smallInfoCard4Highlighted,
      smallInfoCard5Title,
      smallInfoCard5Content,
      smallInfoCard5Url,
      smallInfoCard5Highlighted,
      smallInfoCard6Title,
      smallInfoCard6Content,
      smallInfoCard6Url,
      smallInfoCard6Highlighted,
      wideInfoCardTitle,
      wideInfoCardContent,
      darkInfoCard1Title,
      darkInfoCard1Content,
      darkInfoCard1Url,
      darkInfoCard2Title,
      darkInfoCard2Content,
      darkInfoCard2Url,
      darkInfoCard3Title,
      darkInfoCard3Content,
      darkInfoCard3Url,
      agentReportedSpeed,
      agentReportedAcceleration,
      agentReportedStrength,
      agentReportedAgility,
      agentReportedStamina,
      agentReportedPassing,
      agentReportedBallControl,
      agentReportedFinishing,
      agentReportedHeading,
      agentReportedDefensiveDuels,
      image1,
    } = playerData;

    // Store original uploadUser ID to preserve it when updating (for moderators editing existing players)
    let originalUploadUserId: number | null = null;
    let isModerator = false;
    let uploadUserId: number | null = null;

    // If playerId is provided, verify the player exists and belongs to the user
    if (playerId) {
      const existingPlayer = await strapi.entityService.findOne('api::player.player', playerId, {
        populate: ['uploadUser'],
      });

      if (!existingPlayer) {
        return { error: 'PLAYER_NOT_FOUND' };
      }

      // Check if the player was created by this user, or if the user is a moderator
      const playerData = (existingPlayer as any).attributes || existingPlayer;
      uploadUserId = playerData.uploadUser?.id || playerData.uploadUser;

      // Fetch full user data to check if user is a moderator
      const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
      const userData = (currentUser as any).attributes || currentUser;
      isModerator = userData.isModerator === true;

      // Allow edit if user is the uploader OR if user is a moderator
      if (uploadUserId !== user.id && !isModerator) {
        return { error: 'UNAUTHORIZED' };
      }

      // Store the original uploadUser ID to preserve it when updating
      originalUploadUserId = uploadUserId;
    }

    // Prepare data object for create/update
    const dataToSave: any = {
      slug,
      name,
      club: club || 'Free Agent',
      league: league || 'Free Agent',
      position,
      secondaryPosition,
      jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
      birthDate: birthDate || null,
      age: age ? parseInt(age) : null,
      heightCm: heightCm ? parseInt(heightCm) : null,
      weightKg: weightKg ? parseInt(weightKg) : null,
      foot,
      nationality,
      euStatus: euStatus || false,
      youtubeVideoId,
      richTextMarkdown,
      smallInfoCard1Title,
      smallInfoCard1Content,
      smallInfoCard1Url,
      smallInfoCard1Highlighted: smallInfoCard1Highlighted || false,
      smallInfoCard2Title,
      smallInfoCard2Content,
      smallInfoCard2Url,
      smallInfoCard2Highlighted: smallInfoCard2Highlighted || false,
      smallInfoCard3Title,
      smallInfoCard3Content,
      smallInfoCard3Url,
      smallInfoCard3Highlighted: smallInfoCard3Highlighted || false,
      smallInfoCard4Title,
      smallInfoCard4Content,
      smallInfoCard4Url,
      smallInfoCard4Highlighted: smallInfoCard4Highlighted || false,
      smallInfoCard5Title,
      smallInfoCard5Content,
      smallInfoCard5Url,
      smallInfoCard5Highlighted: smallInfoCard5Highlighted || false,
      smallInfoCard6Title,
      smallInfoCard6Content,
      smallInfoCard6Url,
      smallInfoCard6Highlighted: smallInfoCard6Highlighted || false,
      wideInfoCardTitle,
      wideInfoCardContent,
      darkInfoCard1Title,
      darkInfoCard1Content,
      darkInfoCard1Url,
      darkInfoCard2Title,
      darkInfoCard2Content,
      darkInfoCard2Url,
      darkInfoCard3Title,
      darkInfoCard3Content,
      darkInfoCard3Url,
      agentReportedSpeed: agentReportedSpeed ? parseFloat(agentReportedSpeed) : null,
      agentReportedAcceleration: agentReportedAcceleration ? parseFloat(agentReportedAcceleration) : null,
      agentReportedStrength: agentReportedStrength ? parseFloat(agentReportedStrength) : null,
      agentReportedAgility: agentReportedAgility ? parseFloat(agentReportedAgility) : null,
      agentReportedStamina: agentReportedStamina ? parseFloat(agentReportedStamina) : null,
      agentReportedPassing: agentReportedPassing ? parseFloat(agentReportedPassing) : null,
      agentReportedBallControl: agentReportedBallControl ? parseFloat(agentReportedBallControl) : null,
      agentReportedFinishing: agentReportedFinishing ? parseFloat(agentReportedFinishing) : null,
      agentReportedHeading: agentReportedHeading ? parseFloat(agentReportedHeading) : null,
      agentReportedDefensiveDuels: agentReportedDefensiveDuels ? parseFloat(agentReportedDefensiveDuels) : null,
      // Preserve original uploadUser if editing existing player, otherwise set to current user
      uploadUser: playerId && originalUploadUserId ? originalUploadUserId : user.id,
    };

    // If the uploader (not a moderator) is editing the player, reset moderator status
    if (playerId && uploadUserId === user.id) {
      // Clear moderator message and reset to pending review
      dataToSave.moderatorMessage = '';
      dataToSave.needsModeratorCheck = true;
      dataToSave.hidden = true;
    }

    // Handle image upload - upload to Strapi media library first, then save ID
    let image1Id: number | null = null;
    
    if (imageFile) {
      // Upload the image file to Strapi media library
      try {
        // Get or create the playerImages folder
        const folderService = strapi.plugin('upload').service('folder');
        
        // Try to find existing folder by path
        let playerImagesFolder;
        try {
          const folders = await strapi.entityService.findMany('plugin::upload.folder', {
            filters: {
              path: {
                $eq: '/playerImages',
              },
            },
            limit: 1,
          });
          
          if (folders && folders.length > 0) {
            playerImagesFolder = folders[0];
          }
        } catch (e) {
          // Folder search failed, will create new one
        }
        
        if (!playerImagesFolder) {
          // Create the folder if it doesn't exist
          // Get the highest pathId to create a new one
          const allFolders = await strapi.entityService.findMany('plugin::upload.folder', {
            sort: { pathId: 'desc' },
            limit: 1,
          });
          
          const nextPathId = allFolders && allFolders.length > 0 
            ? (allFolders[0].pathId || 0) + 1 
            : 1;
          
          playerImagesFolder = await strapi.entityService.create('plugin::upload.folder', {
            data: {
              name: 'playerImages',
              path: '/playerImages',
              pathId: nextPathId,
            },
          });
        }

        // Get file extension from original filename
        const originalName = imageFile.name || imageFile.filename || 'image';
        const fileExtension = originalName.includes('.') 
          ? originalName.substring(originalName.lastIndexOf('.')) 
          : '.jpg';
        
        // Create custom filename: {slug}-image1.{extension}
        const customFileName = `${slug}-image1${fileExtension}`;
        
        // Modify the file object to use custom name
        // The file object from ctx.request.files has specific properties
        // We need to ensure all name-related properties are set so S3 uses the custom name
        const customFile = {
          ...imageFile,
          name: customFileName,
          filename: customFileName,
          originalname: customFileName, // Some providers use originalname
        };

        const uploadService = strapi.plugin('upload').service('upload');
        // The upload service expects files as an array
        // Upload with custom filename and folder - this should be used by S3 provider
        const uploadedFiles = await uploadService.upload({
          data: {
            folder: playerImagesFolder.id, // Set the folder ID in upload data
            fileInfo: {
              name: customFileName, // Explicitly set name in fileInfo
              folder: playerImagesFolder.id, // Also set folder in fileInfo
            },
          },
          files: Array.isArray(customFile) ? customFile : [customFile],
        });
        
        // The service returns an array of uploaded files
        if (uploadedFiles && uploadedFiles.length > 0) {
          const uploadedFile = uploadedFiles[0];
          image1Id = uploadedFile.id;
          
          // Verify and update the file record in Strapi media library to ensure name and folder are set correctly
          // This ensures the name and folder are correct in Strapi's database
          const fileRecord: any = await strapi.entityService.findOne('plugin::upload.file', uploadedFile.id, {
            populate: ['folder'],
          });
          
          // Check if folder is set correctly
          const currentFolderId = (fileRecord?.folder as any)?.id || fileRecord?.folder;
          const needsUpdate = currentFolderId !== playerImagesFolder.id || fileRecord?.name !== customFileName;
          
          if (needsUpdate) {
            await strapi.entityService.update('plugin::upload.file', uploadedFile.id, {
              data: {
                name: customFileName,
                folder: playerImagesFolder.id,
              },
            });
          }
        }
      } catch (uploadError: any) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload image: ' + (uploadError?.message || 'Unknown error'));
      }
    } else if (existingImage1Id !== null && existingImage1Id !== undefined) {
      // Use existing image ID if provided
      image1Id = existingImage1Id;
    } else if (image1 !== undefined && image1 !== null) {
      // Fallback: if image1 is provided as an ID directly (for backward compatibility)
      image1Id = typeof image1 === 'number' ? image1 : parseInt(image1, 10);
    }

    // Set image1 field if we have an ID
    if (image1Id !== null) {
      dataToSave.image1 = image1Id;
    }

    let result;
    if (playerId) {
      // Update existing player
      result = await strapi.entityService.update('api::player.player', playerId, {
        data: dataToSave,
        populate: ['image1'], // Populate image1 to return the full image data
      });
    } else {
      // Create new player
      result = await strapi.entityService.create('api::player.player', {
        data: dataToSave,
        populate: ['image1'], // Populate image1 to return the full image data
      });
    }

    return {
      success: true,
      player: result,
    };
  },

  async deletePlayer({ user, playerId }) {
    if (!playerId) {
      return { error: 'PLAYER_ID_REQUIRED' };
    }

    // Find the player and check ownership
    const player = await strapi.entityService.findOne('api::player.player', playerId, {
      populate: ['uploadUser'],
    });

    if (!player) {
      return { error: 'PLAYER_NOT_FOUND' };
    }

    // Check if the player was created by this user
    const playerData = (player as any).attributes || player;
    const uploadUserId = playerData.uploadUser?.id || playerData.uploadUser;

    if (uploadUserId !== user.id) {
      return { error: 'UNAUTHORIZED' };
    }

    // Delete the player
    await strapi.entityService.delete('api::player.player', playerId);

    return {
      success: true,
      message: 'Player deleted successfully',
    };
  },
}));
