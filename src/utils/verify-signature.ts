import { ec } from "elliptic";
import cryptoHash from "./crypto-hash";

/**
 * Verifies an elliptic secp256k1 signature
 *
 * @param publicKey string
 * @param signature ec.Signature
 * @param data string
 * @returns boolean
 */
export default function verifySignature(
    publicKey: string,
    signature: ec.Signature,
    data: string
): boolean {
    const keyPair = new ec("secp256k1").keyFromPublic(publicKey, "hex");
    return keyPair.verify(cryptoHash(data), signature);
}
