import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import router from "./router";
import serverBoot from "./server-boot";

// Here are the tasks that should run on api boot
export default function apiBoot() {
    // create the server
    const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({});

    // api endpoints routing
    router(server);

    // listen to a port
    serverBoot(server);
}
