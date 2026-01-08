// @ts-nocheck
import { Client, Wallet, xrpToDrops, isoTimeToRippleTime } from 'xrpl';
import dayjs from 'dayjs';
import cc from 'five-bells-condition';
import { Buffer } from 'buffer';



/**
 * Validates if a fulfillment matches a condition locally.
 * This prevents the "any key works" bug in your UI logic.
 */
export const verifyFulfillmentLocal = (conditionHex, fulfillmentHex) => {
  try {
    const fulfillment = cc.Fulfillment.fromBinary(Buffer.from(fulfillmentHex, 'hex'));
    const generatedCondition = fulfillment.getConditionBinary().toString('hex').toUpperCase();
    return generatedCondition === conditionHex.toUpperCase();
  } catch (e) {
    return false;
  }
};


/**
 * Generates a Condition (Lock) and Fulfillment (Key) using browser-native crypto.
 */
export const generateEscrowKeys = () => {
  const preimage = window.crypto.getRandomValues(new Uint8Array(32));
  const fulfillment = new cc.PreimageSha256();
  fulfillment.setPreimage(Buffer.from(preimage));

  return {
    condition: fulfillment.getConditionBinary().toString('hex').toUpperCase(),
    fulfillment: fulfillment.serializeBinary().toString('hex').toUpperCase()
  };
};

/**
 * Creates the Escrow on-chain.
 */
export const createGigEscrow = async (client, seed, details) => {
  const { amount, destination, condition, deadlineInSeconds = 3600 } = details;
  const wallet = Wallet.fromSeed(seed);
  
  // XRPL requires Ripple Epoch time for CancelAfter
  const cancelAfterRipple = isoTimeToRippleTime(
    dayjs().add(deadlineInSeconds, 'seconds').toISOString()
  );

  const prepared = await client.autofill({
    TransactionType: "EscrowCreate",
    Account: wallet.address,
    Amount: xrpToDrops(amount),
    Destination: destination,
    CancelAfter: cancelAfterRipple,
    Condition: condition,
  });

  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  // Return the sequence number of this specific transaction
  return {
    sequence: tx.result.Sequence || tx.result.tx_json.Sequence,
    rawResponse: tx
  };
};

// lib/xrpl/escrow.js

/**
 * Finish the Escrow (Claim Funds)
 * Logic Fix: Added storedOwnerAddress to the destructuring.
 */
export const finishGigEscrow = async (client, seed, details) => {
  // Destructure all required fields from the 'details' object
  const { 
    ownerAddress, 
    sequence, 
    condition, 
    fulfillment, 
    isMock, 
    storedOwnerAddress // FIX: This was missing from destructuring
  } = details;

  // 1. Cryptographic Validation
  const isKeyValid = verifyFulfillmentLocal(condition, fulfillment);
  if (!isKeyValid) {
    throw new Error("Cryptographic Mismatch: This key does not open this escrow.");
  }

  // 2. Identity Validation
  // Logic Fix: Ensure we compare the user input against what was saved in localStorage
  if (ownerAddress.trim().toUpperCase() !== storedOwnerAddress.trim().toUpperCase()) {
    throw new Error(`Identity Mismatch: Provided address does not match the Escrow Owner.`);
  }

  // --- MOCK MODE BYPASS ---
  if (isMock) {
    await new Promise(res => setTimeout(res, 800));
    return { success: true, method: "MOCK_SUCCESS", result: { meta: { TransactionResult: "tesSUCCESS" } } };
  }

  // --- REAL XRPL TRANSACTION ---
  const wallet = Wallet.fromSeed(seed);
  const prepared = await client.autofill({
    TransactionType: "EscrowFinish",
    Account: wallet.address,
    Owner: ownerAddress, 
    OfferSequence: Number(sequence),
    Condition: condition,
    Fulfillment: fulfillment,
  });

  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  return { 
    success: tx.result.meta.TransactionResult === "tesSUCCESS",
    result: tx.result
  };
};

/**
 * Cancels the escrow (only works after the deadline has passed).
 */
export const cancelGigEscrow = async (client, seed, details) => {
  const { ownerAddress, sequence, isMock } = details;

  if (isMock) {
    await new Promise(res => setTimeout(res, 800));
    return { success: true };
  }

  const wallet = Wallet.fromSeed(seed);
  const prepared = await client.autofill({
    TransactionType: "EscrowCancel",
    Account: wallet.address,
    Owner: ownerAddress,
    OfferSequence: Number(sequence),
  });

  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  return { success: tx.result.meta.TransactionResult === "tesSUCCESS" };
};