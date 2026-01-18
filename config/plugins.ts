export default ({ env }) => {
  const isDev = env.bool('IS_DEV', false);
  const baseRootPath = isDev ? 'dev' : 'prod';
  const rootPath = `${baseRootPath}/playerImages`;

  // Get AWS credentials
  const accessKeyId = env('AWS_ACCESS_KEY_ID');
  const secretAccessKey = env('AWS_ACCESS_SECRET');
  const region = env('AWS_REGION');
  const bucket = env('AWS_BUCKET');

  // Validate required credentials
  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    const missing = [];
    if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
    if (!secretAccessKey) missing.push('AWS_ACCESS_SECRET');
    if (!region) missing.push('AWS_REGION');
    if (!bucket) missing.push('AWS_BUCKET');
    
    console.error(`[Strapi S3 Upload] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[Strapi S3 Upload] Please set these as Heroku Config Vars or in your .env file');
  }

  // Get SMTP configuration for email
  const smtpHost = env('SMTP_HOST');
  const smtpPort = env.int('SMTP_PORT', 587);
  const smtpUser = env('SMTP_USER');
  const smtpPassword = env('SMTP_PASSWORD');
  const smtpFromEmail = env('SMTP_FROM_EMAIL');
  const smtpFromName = env('SMTP_FROM_NAME', 'NK Tabor Moverball');

  return {
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            region: region,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            credentials: {
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
            },
            params: {
              Bucket: bucket,
              ACL: 'private',
            },
          },
          baseUrl: env('AWS_BASE_URL', 'https://mover-scouts-bucket.s3.eu-central-1.amazonaws.com'),
          rootPath: rootPath,
        },
        actionOptions: {
          upload: {
            // Custom upload action to ensure filename is used in S3
            // The S3 provider will use the file's name field from the database
          },
          uploadStream: {},
          delete: {},
        },
        security: {
          checkFileSize: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ],
        },
      },
    },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        },
        settings: {
          defaultFrom: `"${smtpFromName}" <${smtpFromEmail}>`,
          defaultReplyTo: smtpFromEmail,
        },
      },
    },
  };
};
