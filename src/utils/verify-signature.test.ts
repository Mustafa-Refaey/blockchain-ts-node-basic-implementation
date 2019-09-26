import { Wallet } from "../wallet";
import verifySignature from "./verify-signature";

describe("verifySignature()", () => {
    const wallet = new Wallet();
    const data = "data";

    describe("when passed valid `publicKey`, `signature`, `data`", () => {
        it("should return true", () => {
            expect(verifySignature(wallet.publicKey, wallet.sign(data), data)).toBe(true);
        });
    });

    describe("when passed invalid `publicKey`, `signature`, `data`", () => {
        let anotherWallet: Wallet;

        beforeEach(() => {
            anotherWallet = new Wallet();
        });

        describe("when passed invalid `publicKey`", () => {
            it("should return false", () => {
                expect(verifySignature(anotherWallet.publicKey, wallet.sign(data), data)).toBe(
                    false
                );
            });
        });

        describe("when passed invalid `signature`", () => {
            it("should return false", () => {
                expect(verifySignature(wallet.publicKey, anotherWallet.sign(data), data)).toBe(
                    false
                );
            });
        });

        describe("when passed invalid `data`", () => {
            const invalidData = "invalid-data";
            it("should return false", () => {
                expect(verifySignature(wallet.publicKey, wallet.sign(data), invalidData)).toBe(
                    false
                );
            });
        });
    });
});
