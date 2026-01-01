/**
 * registration-whitelist controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::registration-whitelist.registration-whitelist', ({ strapi }) => ({
  async register(ctx) {
    try {
      const { fullName, email, password } = ctx.request.body;

      // Validate required fields
      if (!fullName || !email || !password) {
        return ctx.badRequest('Full name, email, and password are required');
      }

      // Validate full name
      if (fullName.trim().length < 2) {
        return ctx.badRequest('Full name must be at least 2 characters long');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('Invalid email format');
      }

      // Validate password length
      if (password.length < 6) {
        return ctx.badRequest('Password must be at least 6 characters long');
      }

      // Check if email already exists
      const existingUsers = await strapi.entityService.findMany(
        'plugin::users-permissions.user' as any,
        {
          filters: {
            email: {
              $eq: email.toLowerCase().trim(),
            },
          },
          limit: 1,
        }
      );

      if (existingUsers && existingUsers.length > 0) {
        return ctx.badRequest('Email already exists');
      }

      // Check if email is in registration whitelist
      const whitelistEntries = await strapi.entityService.findMany(
        'api::registration-whitelist.registration-whitelist' as any,
        {
          filters: {
            email: {
              $eq: email.toLowerCase().trim(),
            },
          },
          limit: 1,
        }
      );

      if (!whitelistEntries || whitelistEntries.length === 0) {
        return ctx.forbidden('Registration is currently restricted. Your email is not on the whitelist.');
      }

      const whitelistData = whitelistEntries[0] as any;
      const isClubAdmin = whitelistData.isClubAdmin || false;

      // Generate username from email (required by Strapi)
      // Take the part before @ and ensure it's unique
      let baseUsername = email.split('@')[0].toLowerCase();
      // Remove any non-alphanumeric characters except dots and underscores
      baseUsername = baseUsername.replace(/[^a-z0-9._]/g, '');
      // Ensure minimum length of 3 (Strapi requirement)
      if (baseUsername.length < 3) {
        baseUsername = baseUsername + '123'; // Add padding if too short
      }

      // Ensure username is unique by appending numbers if needed
      let username = baseUsername;
      let counter = 1;
      while (true) {
        const existingUsers = await strapi.entityService.findMany(
          'plugin::users-permissions.user' as any,
          {
            filters: {
              username: {
                $eq: username,
              },
            },
            limit: 1,
          }
        );
        
        if (!existingUsers || existingUsers.length === 0) {
          break; // Username is available
        }
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Get the default role (usually "Authenticated")
      const roles = await strapi.entityService.findMany(
        'plugin::users-permissions.role' as any,
        {
          filters: {
            type: {
              $eq: 'authenticated',
            },
          },
          limit: 1,
        }
      );

      if (!roles || roles.length === 0) {
        return ctx.internalServerError('Default role not found');
      }

      const defaultRole = roles[0];

      // Create the new user using users-permissions service (handles password hashing)
      const userService = strapi.plugin('users-permissions').service('user');
      const newUser = await userService.add({
        username,
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        isClubAdmin: isClubAdmin,
        role: defaultRole.id,
        confirmed: true, // Auto-confirm users
        blocked: false,
        provider: 'local',
      });

      // Generate JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: newUser.id,
      });

      // Return user data and JWT token (similar to login response)
      return ctx.send({
        jwt,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName || fullName.trim(),
          isClubAdmin: newUser.isClubAdmin || false,
        },
      });
    } catch (err: any) {
      // Log the error for debugging
      console.error('Registration error:', err);
      
      // Handle unique constraint violations
      if (err?.message && err.message.includes('unique')) {
        if (err.message.includes('email')) {
          return ctx.badRequest('Email already exists');
        }
      }
      
      // Return a more detailed error message
      const errorMessage = err?.message || 'Unknown error occurred';
      return ctx.badRequest('Registration failed', { error: errorMessage });
    }
  },
}));

