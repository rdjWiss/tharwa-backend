import { Server} from "./server";
import * as fs from 'fs';
import * as https from 'https';
import { IndexRoutes } from './routes/index'

const server =new Server();

server.app.use(IndexRoutes)

export const appServer=server

