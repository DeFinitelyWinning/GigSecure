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

/**
 * Claims the funds using the fulfillment key.
 */
export const finishGigEscrow = async (client, seed, details) => {
  const { ownerAddress, sequence, condition, fulfillment, isMock } = details;

  // LOGIC FIX: Explicitly check the key even in Mock Mode
  const isValid = verifyFulfillmentLocal(condition, fulfillment);
  
  if (!isValid) {
    throw new Error("Cryptographic Mismatch: The provided key does not open this escrow.");
  }

  if (isMock) {
    await new Promise(res => setTimeout(res, 800));
    return { success: true, method: "MOCK_SUCCESS" };
  }

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
    raw: tx 
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