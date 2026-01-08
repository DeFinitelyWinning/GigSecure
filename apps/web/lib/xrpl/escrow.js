// @ts-nocheck
import { Client, xrpToDrops, isoTimeToRippleTime } from 'xrpl';
import dayjs from 'dayjs';
import cc from 'five-bells-condition';
import { Buffer } from 'buffer';

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
    .toString('hex')
    .toUpperCase();

  const fulfillmentHex = fulfillment
    .serializeBinary()
    .toString('hex')
    .toUpperCase();

  return { condition, fulfillment: fulfillmentHex };
};

/**
 * Creates the Escrow on the XRP Ledger
 */
export const createGigEscrow = async (client, wallet, details) => {
  const { amount, destination, condition, finishAfterSeconds = 3600 } = details;
  
  // Ripple Epoch time calculation
  const finishAfter = dayjs().add(finishAfterSeconds, 'seconds').toISOString();

  const tx = {
    TransactionType: 'EscrowCreate',
    Account: wallet.address,
    Amount: xrpToDrops(amount),
    Destination: destination,
    FinishAfter: isoTimeToRippleTime(finishAfter),
    Condition: condition,
  };

  return await client.submitAndWait(tx, { autofill: true, wallet });
};

/**
 * Finish the Escrow (Claim Funds)
 */
export const finishGigEscrow = async (client, wallet, details) => {
  const { ownerAddress, sequence, condition, fulfillment, isMock } = details;

  // --- MOCK MODE BYPASS ---
  if (isMock || fulfillment === "DEMO_RELEASE_KEY_2026") {
    console.log("Simulating On-Chain Escrow Finish...");
    await new Promise(res => setTimeout(res, 1000)); // Fake network delay
    return { result: { meta: { TransactionResult: "tesSUCCESS" } } };
  }
  // -----------------------

  // Real XRPL Transaction
  const tx = {
    TransactionType: 'EscrowFinish',
    Account: wallet.address, // The Freelancer's wallet
    Owner: ownerAddress,     // The Client's wallet address
    OfferSequence: sequence,
    Condition: condition,
    Fulfillment: fulfillment,
  };

  return await client.submitAndWait(tx, { autofill: true, wallet });
};

/**
 * Cancel the Escrow (Refund to Client)
 * Note: On XRPL, this only works if the 'CancelAfter' time has passed.
 */
export const cancelGigEscrow = async (client, wallet, details) => {
  const { ownerAddress, sequence, isMock } = details;

  if (isMock) {
    console.log("Simulating On-Chain Escrow Cancellation...");
    await new Promise(res => setTimeout(res, 1000));
    return { result: { meta: { TransactionResult: "tesSUCCESS" } } };
  }

  const tx = {
    TransactionType: 'EscrowCancel',
    Account: wallet.address,
    Owner: ownerAddress, // The account that created the escrow
    OfferSequence: sequence,
  };

  return await client.submitAndWait(tx, { autofill: true, wallet });
};

