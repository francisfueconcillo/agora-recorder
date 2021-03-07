# Agora-Recorder and Backend API

Based on [OpenAgoraWeb-React](https://github.com/AgoraIO-Community/OpenAgoraWeb-React)

## API Features
- Token Generation
- Start, query and stop recording
- Get list of recorded files from AWS S3

## Prerequisites
- Agora Account
- Agora SDK Web v3.4.0
- AWS S3 for storing recorded files

# Environment Variables
Variable | Required | Description | Example
--- | --- | --- | ---
CUSTOMERID | Yes | Agora Customer ID when Agora API is enabled from Agora Dashboard | none
CUSTOMER_SECRET | Yes | Agora Customer Secret when Agora API is enabled from Agora Dashboard | none
APP_ID | Yes | Your Agora App Id (can be retrieved from Dashboard) | none
APP_CERT | Yes | Your Agora App Certificate (can be retrieved from Dashboard) | none
AGORA_TOKEN_EXPIRY | Yes | Expiry time for token in seconds | 3600
AWS_S3_BUCKET | Yes | AWS S3 Bucket name to store the recorded files | none
AWS_S3_ACCESS_KEY | Yes | AWS S3 Access key, used by Agora to store files | none
AWS_S3_SECRET_KEY | Yes | AWS S3 Access Secret key, used by Agora to store files | none
AWS_S3_REGION_AGORA_ID | Yes | S3 Region ID (integer) defined by Agora [See here](https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest#storageConfig) | 8
AWS_S3_REGION_SHORT_NAME | Yes | S3 Region short-name defined by AWS | ap-southeast-1
PORT | Yes | Port to run the application | Defaults to 9000

## Run Locally
- Install dependencies
```
npm i
```
- Set variables in `.env-dev` file (See Environment Variables)
- Run in development mode
```
npm run start:dev
```

## Token Generation
- Endpoint: `/api/token?cname=<channel-name>&uid=<user id>&attendee=<attendee type>`. 
- Where `<attendee type>` can either be `host` or `audience`. `<user id>` must be an parsable to integer
- Example:
```
GET `http://localhost:9000/api/token?cname=mychannel&uid=123456&attendee=host`
```

## Start Recording
- Start Recording Endpoint: `/api/start?cname=<channel-name>&uid=<user id>&ctype=<channel type>$token=<token>`. 
- Where `<channel type>` can either be `rtc` or `live`. `<token>` is the token used when joining the channel.
- Example:
```
GET http://localhost:9000/api/start?cname=xxx&uid=454976650&ctype=rtc&token=006ba22c24da19b40c8a85f3a6d84709499IAAZBrwqE30GZ068A3miE80mVn3SHGgq/g3L5wfdBdlMQArqmxyep+9FIgDkJ+2bJDJEYAQAAQC07kJgAgC07kJgAwC07kJgBAC07kJg
```

## Query Recording
- Query Recording Endpoint: `/api/query?resid=<resourceId>&sid=<sid>`. 
- Where `<resourceId>` and `sid` were returned when Starting the recording was successful.
- Example:
```
GET http://localhost:9000/api/query?resid=Etkl6g-zSB7EpP-Da1zN65HXLQnA2s-23cPxAwEFqYa-dUpO_sEhEi0l28yje7llfzYhNKbfpaSh9eFjc1ACYMo8BmzXLBSVCGAjy7jbAMrgyErZDSo_ZOOK2rsK5FwnHU81NVuHCs6dheHzM4LHdrkaHAAj_9eP7ZUs-R6VBa5Qzc1nznZGABI-i50vl81aQZwCWGqZXafRlVbQ9ynfGI-SjLuxVZl23jXEWgdcRzFYrxlyVFEav1--jiia7vZHQMoAUmUZokKPj_ybXlDrolWmci92WtXAoBLRfCgkcnrH3Pwh1rIY9mFazMNXGUOK&sid=cdec9b05864dac43120aa983ecafcab4
```

## Stop Recording
- Stop Recording Endpoint: `/api/stop?cname=<channel-name>&uid=<user id>&resid=<resourceId>&sid=<sid>`. 
- Where `<resourceId>` and `sid` were returned when Starting the recording was successful.
- Example:
```
GET http://localhost:9000/api/stop?cname=xxx&uid=783211661&resid=Etkl6g-zSB7EpP-Da1zN65HXLQnA2s-23cPxAwEFqYa-dUpO_sEhEi0l28yje7llfzYhNKbfpaSh9eFjc1ACYEBwA3Fsps5hwQPlX_4AkU8QzYzJbgjxar6h6kG-M-_KGiYbNq5WgkkEKtk2eaK8nu5VYKR7N2uiqdI3IOTY_hD3F9CsepUQEkQXa4AEJb5XYfd6s0UEpoFDvuyrJD8lqZ_NJh81jtLTFVHDaZJd2Ivo-XwEiQVSmmFRfc0r6yDB29yFsxyj9VO-uonnjHubZCKr_6k3hFgUXY2oVY3SilmOPA8GuGkllSmBYdaRcDfc&sid=063686235c4b7a4a9d817e8381a97477
```

## Get list of recorded files
- Get List of Records from AWS S3: `/api/records`. 
- Example:
```
GET http://localhost:9000/api/records
```
- Records are stored with User ID used as a directory in S3
- Example output:
```
[{
  ETag: ""e9e17cd5fe38aed658bb54621f33eb57"",
  Key: "186097644/389c00c6c442b54be725a386af9600b1_zzz.m3u8", 
  LastModified: "2021-03-06T14:13:08.000Z",
  Owner: {...},
  Size: 339,
  StorageClass: "STANDARD"
}, {
  Key: "186097644/389c00c6c442b54be725a386af9600b1_zzz_20210306141224230.ts"
  ETag: ""57240708249ec01af442f871f40d7613"",
  Key: "186097644/389c00c6c442b54be725a386af9600b1_zzz_20210306141224230.ts"
  LastModified: "2021-03-06T14:12:42.000Z",,
  Owner: {...},
  Size: 205672,
  StorageClass: "STANDARD",
}
....
]
```

