/**
 * registration-whitelist controller
 */

import { factories } from '@strapi/strapi';
import nodemailer from 'nodemailer';

// Function to send welcome email to new user
async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
    const smtpFromName = process.env.SMTP_FROM_NAME || 'NK Tabor Moverball';

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
      console.error('Missing required SMTP environment variables');
      return { success: false, error: 'Missing required SMTP environment variables' };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email HTML template with red theme colors
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .email-bg-container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .email-outer-container {
              max-width: 100% !important;
              width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding: 1px !important;
            }
            .email-container {
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
            .email-title-card {
              margin-left: 2px !important;
              margin-right: 2px !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              padding-top: 28px !important;
              padding-bottom: 28px !important;
            }
            .email-card {
              margin-left: 2px !important;
              margin-right: 2px !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              padding-top: 28px !important;
              padding-bottom: 28px !important;
            }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div class="email-bg-container" style="width: 100%; height: 100%; background-color: #fef2f2; border-radius: 16px;">
          <div class="email-outer-container" style="max-width: 900px; margin: 20px auto; padding: 20px;">
            <div style="border-radius: 12px; overflow: hidden;">
              <div class="email-container" style="background-color: #fef2f2; padding: 20px;">
                <div class="email-title-card" style="background-color: #E9001D; padding: 32px; border-radius: 8px; margin-bottom: 24px; margin-top: 0; box-shadow: 0 4px 12px rgba(233, 0, 29, 0.2);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; text-align: center;">Welcome to NK Tabor x Mover scouting</h1>
                </div>
                
                <div class="email-card" style="background-color: #ffffff; padding: 32px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <p style="margin: 0 0 16px 0; font-size: 18px; color: #1e293b;">Hello <strong>${userName}</strong>,</p>
                  
                  <p style="margin: 0 0 16px 0; font-size: 18px; color: #334155;">
                    Your account is ready.<br>
                    You're now part of the NK Tabor Sežana x Mover scouting community.<br>
                    Your input contributes to real shortlists and real trial opportunities.
                  </p>
                  
                  <div style="background-color: #FEE2E7; border-left: 4px solid #E9001D; padding: 20px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: #C20019;">What you can do now</p>
                    <ul style="margin: 0; padding-left: 24px; font-size: 16px; color: #475569;">
                      <li style="margin-bottom: 8px;">Review and evaluate players in the current pool</li>
                      <li style="margin-bottom: 8px;">Submit your scouting assessments</li>
                      <li style="margin-bottom: 8px;">Receive feedback as players progress through the scouting process</li>
                      <li style="margin-bottom: 8px;">Follow which players move to the next stage</li>
                      <li style="margin-bottom: 8px;">Be recognized and rewarded when players you supported progress to trials or contracts</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://nktabor.moverball.com/players" style="display: inline-block; background-color: #E9001D; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; transition: background-color 0.3s;">Start Scouting</a>
                  </div>
                  
                  <div style="padding-top: 24px; border-top: 2px solid #FEE2E7; margin-top: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: #64748b;">
                      If you need help or have questions, you can reach us via email.
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 18px; color: #1e293b;">
                      Best regards,<br>
                      <strong style="color: #E9001D;">NK Tabor Sežana × Mover</strong>
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} NK Tabor Moverball. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email plain text version
    const emailText = `
Welcome to NK Tabor x Mover scouting

Hello ${userName},

Your account is ready. 
You're now part of the NK Tabor Sežana x Mover scouting community.
Your input contributes to real shortlists and real trial opportunities.

What you can do now
- Review and evaluate players in the current pool
- Submit your scouting assessments
- Receive feedback as players progress through the scouting process
- Follow which players move to the next stage
- Be recognized and rewarded when players you supported progress to trials or contracts

Start Scouting: https://nktabor.moverball.com/players

If you need help or have questions, you can reach us via email.

Best regards,
NK Tabor Sežana × Mover

© ${new Date().getFullYear()} NK Tabor Moverball. All rights reserved.
    `;

    // Prepare email options
    const mailOptions = {
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: userEmail,
      subject: 'Welcome to NK Tabor x Mover scouting',
      text: emailText,
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to send password reset email
async function sendPasswordResetEmail(userEmail: string, resetToken: string, userName: string) {
  try {
    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
    const smtpFromName = process.env.SMTP_FROM_NAME || 'NK Tabor Moverball';
    // Get frontend URL - ensure it's a full URL (not relative)
    let frontendUrl = process.env.FRONTEND_URL || 'https://nktabor.moverball.com';
    // Ensure it doesn't have a trailing slash
    frontendUrl = frontendUrl.replace(/\/$/, '');
    const resetPasswordUrl = `${frontendUrl}/reset-password?code=${resetToken}`;

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
      console.error('Missing required SMTP environment variables');
      return { success: false, error: 'Missing required SMTP environment variables' };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email HTML template with red theme colors
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .email-bg-container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .email-outer-container {
              max-width: 100% !important;
              width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding: 1px !important;
            }
            .email-container {
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
            .email-title-card {
              margin-left: 2px !important;
              margin-right: 2px !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              padding-top: 28px !important;
              padding-bottom: 28px !important;
            }
            .email-card {
              margin-left: 2px !important;
              margin-right: 2px !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
              padding-top: 28px !important;
              padding-bottom: 28px !important;
            }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div class="email-bg-container" style="width: 100%; height: 100%; background-color: #fef2f2; border-radius: 16px;">
          <div class="email-outer-container" style="max-width: 900px; margin: 20px auto; padding: 20px;">
            <div style="border-radius: 12px; overflow: hidden;">
              <div class="email-container" style="background-color: #fef2f2; padding: 20px;">
                <div class="email-title-card" style="background-color: #E9001D; padding: 32px; border-radius: 8px; margin-bottom: 24px; margin-top: 0; box-shadow: 0 4px 12px rgba(233, 0, 29, 0.2);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; text-align: center;">Reset Your Password</h1>
                </div>
                
                <div class="email-card" style="background-color: #ffffff; padding: 32px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                  <p style="margin: 0 0 16px 0; font-size: 18px; color: #1e293b;">Hello${userName ? ` <strong>${userName}</strong>` : ''},</p>
                  
                  <p style="margin: 0 0 16px 0; font-size: 18px; color: #334155;">
                    We received a request to reset your password for your NK Tabor Moverball account.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetPasswordUrl}" style="display: inline-block; background-color: #E9001D; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; transition: background-color 0.3s;">Reset Password</a>
                  </div>
                  
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #64748b;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; word-break: break-all;">
                    ${resetPasswordUrl}
                  </p>
                  
                  <div style="background-color: #FEE2E7; border-left: 4px solid #E9001D; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #C20019;">
                      <strong>Security tip:</strong> This link will expire after you use it. If you didn't request a password reset, please ignore this email.
                    </p>
                  </div>
                  
                  <div style="padding-top: 24px; border-top: 2px solid #FEE2E7; margin-top: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: #64748b;">
                      If you have any questions or need assistance, please contact us via email.
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 18px; color: #1e293b;">
                      Best regards,<br>
                      <strong style="color: #E9001D;">The NK Tabor Moverball Team</strong>
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} NK Tabor Moverball. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email plain text version
    const emailText = `
Reset Your Password

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your NK Tabor Moverball account.

Click the link below to reset your password:
${resetPasswordUrl}

Security tip: This link will expire after you use it. If you didn't request a password reset, please ignore this email.

If you have any questions or need assistance, please contact us via email.

Best regards,
The NK Tabor Moverball Team

© ${new Date().getFullYear()} NK Tabor Moverball. All rights reserved.
    `;

    // Prepare email options
    const mailOptions = {
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: userEmail,
      subject: 'Reset Your Password - NK Tabor Moverball',
      text: emailText,
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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

      // Check if email is in registration whitelist (case-insensitive)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Use database-level case-insensitive comparison (PostgreSQL ILIKE or LOWER())
      // Note: Knex returns snake_case column names, so we need to check both camelCase and snake_case
      const knex = strapi.db.connection;
      const whitelistEntry = await knex('registration_whitelists')
        .whereRaw('LOWER(TRIM(email)) = ?', [normalizedEmail])
        .first();

      if (!whitelistEntry) {
        return ctx.forbidden('Registration is currently restricted. Your email is not on the whitelist.');
      }

      const whitelistData = whitelistEntry as any;
      // Handle both camelCase (from entityService) and snake_case (from raw Knex query)
      const isClubAdmin = whitelistData.isClubAdmin ?? whitelistData.is_club_admin ?? false;
      const isModerator = whitelistData.isModerator ?? whitelistData.is_moderator ?? false;
      const canVote = whitelistData.canVote ?? whitelistData.can_vote ?? true; // Default to true if not specified

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
        isModerator: isModerator,
        canVote: canVote,
        role: defaultRole.id,
        confirmed: true, // Auto-confirm users
        blocked: false,
        provider: 'local',
      });

      // Generate JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: newUser.id,
      });

      // Send welcome email (non-blocking - don't fail registration if email fails)
      sendWelcomeEmail(newUser.email, newUser.fullName || fullName.trim()).catch((emailError) => {
        console.error('Failed to send welcome email, but registration succeeded:', emailError);
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
          isModerator: newUser.isModerator || false,
          canVote: newUser.canVote !== undefined ? newUser.canVote : true,
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

  async forgotPassword(ctx) {
    try {
      const { email } = ctx.request.body;

      // Validate email
      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('Invalid email format');
      }

      // Find user by email
      const users = await strapi.entityService.findMany(
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

      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (users && users.length > 0) {
        const user = users[0];
        
        // Generate reset token using crypto
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(64).toString('hex');

        // Update user with reset token
        await strapi.plugin('users-permissions').service('user').edit(user.id, {
          resetPasswordToken: resetToken,
        });

        // Send email with reset link
        const emailResult = await sendPasswordResetEmail(
          user.email,
          resetToken,
          user.fullName || user.username
        );

        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error);
          // Still return success to user to prevent email enumeration
        } else {
          console.log('Password reset email sent to:', user.email);
        }
      }

      // Always return success message (security best practice)
      return ctx.send({
        ok: true,
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      // Always return success to prevent email enumeration
      return ctx.send({
        ok: true,
      });
    }
  },
}));

