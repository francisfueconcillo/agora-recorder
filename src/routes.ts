import axios from 'axios';
import * as Hapi from "hapi";
import { startRecord, queryRecord, stopRecord } from './agora';


const CONFIG = {
  CUSTOMERID: process.env.CUSTOMERID,
  CUSTOMER_SECRET: process.env.CUSTOMER_SECRET,
  APP_ID: process.env.APP_ID,
  BASE_URL: "https://api.agora.io/v1/apps",
};

const Authorization = `Basic ${Buffer.from(`${CONFIG.CUSTOMERID}:${CONFIG.CUSTOMER_SECRET}`).toString("base64")}`;

const startHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const start = await axios.post(
    `${CONFIG.BASE_URL}/${CONFIG.APP_ID}/cloud_recording/acquire`,
    {
      cname: request.query.cname,
      uid: request.query.uid,
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  )
  .then(async(resp) => {
    if(resp.data && resp.data.resourceId) {
      const startReq:any = await startRecord(
        resp.data.resourceId, 
        request.query.cname, 
        request.query.uid,
        request.query.token,
        request.query.ctype,
      );
      return Promise.resolve(startReq);
    }
    
    throw new Error('Invalid startRecord response.');
  })
  .catch(error => {
      return Promise.resolve(error.response);
  });

  return start.data;
}

const queryHandler = async(request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const query = await queryRecord(request.query.resid, request.query.sid)
  return query.data;
}

const stopHandler = async(request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const stop = await stopRecord(
    request.query.cname,
    request.query.uid,
    request.query.resid, 
    request.query.sid
  );
  return stop.data;
}


export const routes = [{
    method: 'GET',
    path: '/token',
    handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      return 'Agora Recorder';
    }

  }, {
    method: 'GET',
    path: '/start',
    options: {
      cors: true,
      handler: startHandler
    },
  }, {
    method: 'GET',
    path: '/query',
    options: {
      cors: true,
      handler: queryHandler
    },
  }, {
    method: 'POST',
    path: '/stop',
    handler: stopHandler
  }
];
