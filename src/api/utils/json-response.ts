import { FastifyReply } from "fastify";
import { ServerResponse } from "http";

/**
 * Sends a response to the client with a json response
 *
 * @param res FastifyReply<ServerResponse>
 * @param body any
 * @param status number
 */
export default function jsonResponse(res: FastifyReply<ServerResponse>, body: any, status = 200) {
    res.code(status)
        .header("Content-Type", "application/json; charset=utf-8")
        .send(body);
}
