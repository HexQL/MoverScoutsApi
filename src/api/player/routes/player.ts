/**
 * player router
 */

export default {
  routes: [
    // Custom route for community uploaded players count (must come before /players/:id)
    {
      method: 'GET',
      path: '/players/community-count',
      handler: 'player.getCommunityUploadedPlayersCount',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Make this route public (no authentication required)
      },
    },
    // Custom route for uploaded players (must come before /players/:id)
    {
      method: 'GET',
      path: '/players/uploaded',
      handler: 'player.getUploadedPlayers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/players',
      handler: 'player.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/players/edit',
      handler: 'player.editPlayerData',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/players/delete',
      handler: 'player.deletePlayer',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/players/submit-moderator-decision',
      handler: 'player.submitModeratorDecision',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/players/:id',
      handler: 'player.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/players',
      handler: 'player.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/players/:id',
      handler: 'player.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/players/:id',
      handler: 'player.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
