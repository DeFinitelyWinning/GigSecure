// @ts-nocheck
import { xrpToDrops, isoTimeToRippleTime, Client, Wallet } from "xrpl";
import dayjs from "dayjs";
import cc from "five-bells-condition";
import { Buffer } from "buffer";
import * as xrpl from "xrpl";

/**
 * Generates a Condition (Lock) and Fulfillment (Key)
 */
export const generateEscrowKeys = () => {
  // Browser-safe random bytes
  const preimage = window.crypto.getRandomValues(new Uint8Array(32));
  const fulfillment = new cc.PreimageSha256();
  fulfillment.setPreimage(Buffer.from(preimage));

  const condition = fulfillment
    .getConditionBinary()
    .toString("hex")
    .toUpperCase();

  const fulfillmentHex = fulfillment
    .serializeBinary()
    .toString("hex")
    .toUpperCase();

  return { condition, fulfillment: fulfillmentHex };
};

/**
 * Creates the Escrow on the XRP Ledger
 */
export const createGigEscrow = async (client, wallet, details) => {
  const { amount, destination, condition, cancelAfterSeconds = 3600 } = details;

  const cancelTime = dayjs().add(cancelAfterSeconds, "seconds").toISOString();

  const tx = {
    TransactionType: "EscrowCreate",
    Account: wallet.address,
    Amount: xrpToDrops(amount),
    Destination: destination,
    CancelAfter: isoTimeToRippleTime(cancelTime),
    Condition: condition,
  };

  return await client.submitAndWait(tx, { autofill: true, wallet });
};

/**
 * Finish the Escrow (Claim Funds)
 *
 * Supports two call styles:
 *  A) finishGigEscrow(client, wallet, details)   // used by ActiveGigs
 *  B) finishGigEscrow(seed, details)             // standalone helper
 */
export const finishGigEscrow = async (
  clientOrSeed,
  walletOrDetails,
  maybeDetails
) => {
  let client;
  let wallet;
  let details;

  if (maybeDetails) {
    // Style A: (client, wallet, details)
    client = clientOrSeed;
    wallet = walletOrDetails;
    details = maybeDetails;
  } else {
    // Style B: (seed, details)
    const seed = clientOrSeed;
    details = walletOrDetails;

    client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    wallet = xrpl.Wallet.fromSeed(seed);
  }

  const { ownerAddress, sequence, condition, fulfillment, isMock } = details;

  // --- MOCK MODE BYPASS ---
  if (isMock || fulfillment === "DEMO_RELEASE_KEY_2026") {
    console.log("Simulating On-Chain Escrow Finish...");
    await new Promise((res) => setTimeout(res, 1000)); // Fake network delay
    if (!maybeDetails && client) {
      await client.disconnect();
    }
    return { result: { meta: { TransactionResult: "tesSUCCESS" } } };
  }
  // -----------------------

  const tx = {
    TransactionType: "EscrowFinish",
    Account: wallet.address, // The Freelancer's wallet
    Owner: ownerAddress, // The Client's wallet address
    OfferSequence: parseInt(sequence, 10),
    Condition: condition,
    Fulfillment: fulfillment,
  };

  try {
    const result = await client.submitAndWait(tx, { autofill: true, wallet });
    if (!maybeDetails && client) {
      await client.disconnect();
    }
    return result;
  } catch (error) {
    if (!maybeDetails && client) {
      await client.disconnect();
    }
    throw error;
  }
};

/**
 * Cancel the Escrow (Refund to Client)
 * Note: On XRPL, this only works if the 'CancelAfter' time has passed.
 */
export const cancelGigEscrow = async (client, wallet, details) => {
  const { ownerAddress, sequence, isMock } = details;

  if (isMock) {
    console.log("Simulating On-Chain Escrow Cancellation...");
    await new Promise((res) => setTimeout(res, 1000));
    return { result: { meta: { TransactionResult: "tesSUCCESS" } } };
  }

  const tx = {
    TransactionType: "EscrowCancel",
    Account: wallet.address,
    Owner: ownerAddress, // The account that created the escrow
    OfferSequence: sequence,
  };

  return await client.submitAndWait(tx, { autofill: true, wallet });
};
