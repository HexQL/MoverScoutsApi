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
  };
};
