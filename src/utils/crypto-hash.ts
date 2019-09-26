import crypto from "crypto";

/**
 * Creates a hash from the inputs.
 *
 * order of inputs won't affect the output hash as they are sorted
 * before creating the hash
 *
 * @param inputs string[]
 * @returns string
 */
export default function cryptoHash(...inputs: string[]): string {
    const hash = crypto.createHash("sha256");

    hash.update(inputs.sort().join(" "));

    return hash.digest("hex");
}
