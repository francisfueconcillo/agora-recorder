import { Server as HapiServer } from 'hapi';
import axios from 'axios';
import { routes } from './routes';

const init = async () => {

  const server = new HapiServer({
    host: '0.0.0.0',
    port: process.env.PORT || 9000,
    routes: {
      cors: {
          origin: ['*'] // an array of origins or 'ignore'           
      }
    }
  });

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();