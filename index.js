'use strict';

const Hapi = require('@hapi/hapi');
const axios = require('axios');

const CONFIG = {
  CUSTOMERID: "8bae71c39c554cf8884cc562e9859b46",
  CUSTOMER_SECRET: "c5c234633175477e8986d3a446d35494",
  APP_ID: "ba22c24da19b40c8a85f3a6d84709499",
  BASE_URL: "https://api.agora.io/v1/apps",
  AWS_S3_BUCKET: "afs-agora-recording",
  AWS_ACCESS_KEY: "AKIAJHLJUPX5RGQPYFYQ",
  AWS_SECRET_KEY: "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",
}

const authz = `Basic ${Buffer.from(`${CONFIG.CUSTOMERID}:${CONFIG.CUSTOMER_SECRET}`).toString("base64")}`;

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
          return 'Agora Recorder';
      }
    });

    server.route({
      method: 'GET',
      path: '/acquire',
      handler: async(request, h) => {
        const Authorization = authz;
        const acquire = await axios.post(
          `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/acquire`,
          {
            cname: request.body.channel,
            uid: request.body.uid,
            clientRequest: {
              resourceExpiredHour: 24,
            },
          },
          { headers: { Authorization } }
        );
      
        return acquire.data;
      }
    });

    server.route({
      method: 'POST',
      path: '/start',
      handler: async(request, h) => {
        const Authorization = authz;
        const resource = request.body.resource;
        const mode = request.body.mode;

        const start = await axios.post(
          `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
          {
            cname: request.body.channel,
            uid: request.body.uid,
            clientRequest: {
              recordingConfig: {
                maxIdleTime: 30,  // in seconds. Cloud recording automatically stops recording when there is no user in the channel
                streamTypes: 2,  // 0: Audio only, 1: Video only, 2: both
                channelType: 0,  // 0: rtc, 1: live
                videoStreamType: 0,   // 0: low-res, 1: high-res
                transcodingConfig: {
                  height: 640,
                  width: 360,
                  bitrate: 500,
                  fps: 15,
                  mixedVideoLayout: 1,  // 1: floating, 1: best-fit, 2: vertical. https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful
                  backgroundColor: "#000000",
                },
              },
              recordingFileConfig: {
                avFileType: ["hls"],
              },
              
              // https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest#storageConfig
              storageConfig: {
                vendor: 1,
                region: 14,
                bucket: CONFIG.AWS_S3_BUCKET,
                accessKey: CONFIG.AWS_ACCESS_KEY,
                secretKey: CONFIG.AWS.AWS_SECRET_KEY,
                fileNamePrefix: ["agora", "record"],
              },
            },
          },
          { headers: { Authorization } }
        );

        return start.data;
      }
    });


    server.route({
      method: 'GET',
      path: '/stop',
      handler: async(request, h) => {
        const Authorization = authz;
        const resource = request.body.resource;
        const sid = request.body.sid;
        const mode = request.body.mode;

        const stop = await axios.post(
          `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
          {
            cname: request.body.channel,
            uid: request.body.uid,
            clientRequest: {},
          },
          { headers: { Authorization } }
        );
        return stop.data;
      }
    });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();