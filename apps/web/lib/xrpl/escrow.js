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