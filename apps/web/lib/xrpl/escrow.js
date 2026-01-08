// @ts-nocheck
import { Client, xrpToDrops, isoTimeToRippleTime } from "xrpl";
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

  const condition = fulfillment.getConditionBinary().toString("hex").toUpperCase();

  const fulfillmentHex = fulfillment.serializeBinary().toString("hex").toUpperCase();

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

export const finishGigEscrow = async (seed, details) => {
  // 1. Destructure matches the keys sent from ActiveGigs
  const { ownerAddress, sequence, condition, fulfillment } = details;

  // 2. Connect
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // 3. Prepare
  const wallet = xrpl.Wallet.fromSeed(seed);

  const tx = {
    TransactionType: "EscrowFinish",
    Account: wallet.address,
    Owner: ownerAddress,
    OfferSequence: parseInt(sequence), // Good safety habit: ensure it's a number
    Condition: condition,
    Fulfillment: fulfillment,
  };

  try {
    const result = await client.submitAndWait(tx, { autofill: true, wallet });
    client.disconnect();
    return result;
  } catch (error) {
    client.disconnect();
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
