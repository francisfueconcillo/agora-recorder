import axios from 'axios';
import { RtcTokenBuilder } from 'agora-access-token';


const CONFIG = {
  CUSTOMERID: process.env.CUSTOMERID,
  CUSTOMER_SECRET: process.env.CUSTOMER_SECRET,
  APP_ID: process.env.APP_ID,
  APP_CERT: process.env.APP_CERT,
  AGORA_TOKEN_EXPIRY: process.env.AGORA_TOKEN_EXPIRY,
  BASE_URL: "https://api.agora.io/v1/apps",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_REGION_AGORA_ID: process.env.AWS_S3_REGION_AGORA_ID,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
};

const Authorization = `Basic ${Buffer.from(`${CONFIG.CUSTOMERID}:${CONFIG.CUSTOMER_SECRET}`).toString("base64")}`;

export const startRecord = async (
  resourceId, 
  cname, 
  uid, 
  token,
  channelType,
) => {
  const mode = 'mix'; // mix | individual
  const start = await axios.post(
    `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/resourceid/${resourceId}/mode/${mode}/start`,
    {
      cname,
      uid,
      clientRequest: {
        token,
        recordingConfig: {
          maxIdleTime: 30,  // in seconds. Cloud recording automatically stops recording when there is no user in the channel
          streamTypes: 2,  // 0: Audio only, 1: Video only, 2: both
          channelType: channelType === 'live' ? 1:0,  // 0: rtc, 1: live
          videoStreamType: 0,   // 0: low-res, 1: high-res
          transcodingConfig: {
            height: 640,
            width: 360,
            bitrate: 500,
            fps: 15,
            mixedVideoLayout: 1,  // 0: floating, 1: best-fit, 2: vertical. https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful
            backgroundColor: "#000000",
          },
          subscribeVideoUids: [ uid ],
          subscribeAudioUids: [ uid ],
        },
        recordingFileConfig: {
          avFileType: ["hls"],
        },
        
        // https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest#storageConfig
        storageConfig: {
          vendor: 1,
          region: parseInt(CONFIG.AWS_S3_REGION_AGORA_ID),
          bucket: CONFIG.AWS_S3_BUCKET,
          accessKey: CONFIG.AWS_ACCESS_KEY,
          secretKey: CONFIG.AWS_SECRET_KEY,
          fileNamePrefix: [ uid ],
        },
      },
    },
    { headers: { Authorization } }
  );

  return start;
};


export const queryRecord = async(resid, sid) => {
  const mode = 'mix';
  const query = await axios.get(
    `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/resourceid/${resid}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  )
  .catch(error => {
      return Promise.resolve(error.response);
  });

  return query;
};


export const stopRecord = async(cname, uid, resid, sid) => {
    const mode = 'mix';
    const stop = await axios.post(
      `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/resourceid/${resid}/sid/${sid}/mode/${mode}/stop`,
      {
        cname,
        uid,
        clientRequest: {},
      },
      { headers: { Authorization } }
    )
    .catch(error => {
      return Promise.resolve(error.response);
    });
    
    return stop;
};

export const generateToken = (cname, uid, attendeeMode) => {
  return RtcTokenBuilder.buildTokenWithUid(
      CONFIG.APP_ID,
      CONFIG.APP_CERT,
      cname,
      uid,
      attendeeMode, // 1- PUBLISHER, 2_SUBSCRIBER https://docs.agora.io/en/Voice/token_server
      (Math.floor(Date.now() / 1000)) + parseInt(CONFIG.AGORA_TOKEN_EXPIRY)
  )
}

