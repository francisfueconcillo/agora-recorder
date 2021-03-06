import * as AWS from 'aws-sdk';
AWS.config.update({});
AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  region: process.env.AWS_S3_REGION_SHORT_NAME
});

export const S3BucketsList = async () => {
  // Create S3 service object
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  // Call S3 to list the buckets
  let buckets = [];
  
  await s3.listBuckets().promise().then((res) => {
    buckets = res.Buckets;
  });

  return buckets;
}

export const S3ListObjects = async (bucket) => {
  // Create S3 service object
  const s3 = new AWS.S3({apiVersion: '2006-03-01'});

  // Call S3 to list the buckets
  let records = [];

  await s3.listObjects({ Bucket: bucket }).promise().then((res) => {
    records = res.Contents;
  });

  return records;
}