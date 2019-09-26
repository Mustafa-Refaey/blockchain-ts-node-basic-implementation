import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { findAPortNotInUse } from "portscanner";
import { DEFAULT_PORT } from "../config";

/**
 * Start the server
 * @param server fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
 */
export default function serverBoot(
    server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
) {
    // check if this is the root node or a peer node
    if (process.env.GENERATE_PEER_PORT === "true") {
        // in case of a peer node, find an unsed port and listen to it
        findAPortNotInUse(3001, 3999, "127.0.0.1", (error, port) => {
            if (error) {
                console.error(`Could not find an unsed port in range 3001 - 3999`);
            } else {
                serverListen(server, port);
            }
        });
    } else {
        // in case of the root node listen to the default port
        serverListen(server, DEFAULT_PORT);
    }
}

/**
 * make the server listens to a port
 *
 * @param server fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
 * @param port number
 */
function serverListen(
    server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>,
    port: number
) {
    server.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}
