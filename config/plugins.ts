export default ({ env }) => {
  const isDev = env.bool('IS_DEV', false);
  const rootPath = isDev ? 'dev' : 'prod';

  return {
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
            ACL: 'private',
          },
          baseUrl: env('AWS_BASE_URL', 'https://mover-scouts-bucket.s3.eu-central-1.amazonaws.com'),
          rootPath: rootPath,
        },
        actionOptions: {
          upload: {},
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
