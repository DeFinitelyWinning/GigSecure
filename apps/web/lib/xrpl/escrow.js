// @ts-nocheck
import { Client, Wallet, xrpToDrops, isoTimeToRippleTime } from 'xrpl';
import cc from 'five-bells-condition';
import { Buffer } from 'buffer';

const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";

const getClient = async () => {
  const client = new Client(TESTNET_URL);
  await client.connect();
  return client;
};

// ---------------------------------------------------------
// UTILS
// ---------------------------------------------------------

export const verifyFulfillmentLocal = (conditionHex, fulfillmentHex) => {
  try {
    const fulfillment = cc.Fulfillment.fromBinary(Buffer.from(fulfillmentHex, 'hex'));
    const generatedCondition = fulfillment.getConditionBinary().toString('hex').toUpperCase();
    return generatedCondition === conditionHex.toUpperCase();
  } catch (e) {
    console.error("Verification Error:", e);
    return false;
  }
};

export const generateEscrowKeys = () => {
  const preimage = window.crypto.getRandomValues(new Uint8Array(32));
  const fulfillment = new cc.PreimageSha256();
  fulfillment.setPreimage(Buffer.from(preimage));

  return {
    condition: fulfillment.getConditionBinary().toString('hex').toUpperCase(),
    fulfillment: fulfillment.serializeBinary().toString('hex').toUpperCase()
  };
};

// ---------------------------------------------------------
// CORE FUNCTIONS
// ---------------------------------------------------------

export const createGigEscrow = async (seed, details) => {
  const client = await getClient();
  
  try {
    const { amount, destination, condition, deadlineInSeconds = 3600 } = details;
    const wallet = Wallet.fromSeed(seed);
    
    console.log("--- DEBUG: STARTING ESCROW CREATION ---");

    // 1. MANUALLY FETCH CORRECT SEQUENCE (Do not trust autofill)
    const accountInfo = await client.request({
      command: "account_info",
      account: wallet.address,
      ledger_index: "current"
    });
    
    const currentSequence = accountInfo.result.account_data.Sequence;
    console.log("--- DEBUG: REAL ACCOUNT SEQUENCE ---", currentSequence);

    // SAFETY CHECK: If this is > 1 million, we stop immediately.
    if (currentSequence > 1000000) {
        throw new Error(`ABORT: Fetched Sequence is a Ledger Index! (${currentSequence})`);
    }

    // Calculate Timings
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + deadlineInSeconds);
    const cancelAfterRipple = isoTimeToRippleTime(expiryDate.toISOString());

    // 2. CONSTRUCT TRANSACTION WITH FORCED SEQUENCE
    const tx = {
      TransactionType: "EscrowCreate",
      Account: wallet.address,
      Amount: xrpToDrops(amount),
      Destination: destination,
      CancelAfter: cancelAfterRipple,
      Condition: condition,
      Sequence: currentSequence, // <--- WE FORCE THIS
    };

    // 3. Autofill (will fill Fee, but respect our Sequence)
    const prepared = await client.autofill(tx);
    
    // Double check prepared sequence
    if (prepared.Sequence > 1000000) {
         throw new Error("ABORT: Autofill overwrote Sequence with Ledger Index!");
    }

    // 4. Sign and Submit
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`Tx Failed: ${result.result.meta.TransactionResult}`);
    }

    console.log("--- DEBUG: SUCCESS ---");
    
    return {
      success: true,
      sequence: currentSequence, // Return the number we fetched manually
      txHash: result.result.hash,
      owner: wallet.address
    };

  } catch (error) {
    console.error("Create Escrow Error:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
};

export async function finishGigEscrow(secret, { ownerAddress, sequence, fulfillment, condition }) {
  // FIX: Use 'Client' directly (already imported), not 'xrpl.Client'
  const client = new Client("wss://s.altnet.rippletest.net:51233"); 
  await client.connect();

  // FIX: Use 'Wallet' directly (already imported), not 'xrpl.Wallet'
  const wallet = Wallet.fromSeed(secret);

  // 1. Check if sequence is valid before sending
  if (!sequence || isNaN(parseInt(sequence))) {
     throw new Error(`CRITICAL: OfferSequence is missing. Got: ${sequence}`);
  }

  // 2. Construct the Transaction
  const tx = {
    "TransactionType": "EscrowFinish",
    "Account": wallet.address,       // The Freelancer (You)
    "Owner": ownerAddress,           // The Client (Creator)
    "OfferSequence": parseInt(sequence), // The ID of the escrow
    "Fulfillment": fulfillment       // The key to unlock it
  };

  // Only add Condition if explicitly provided
  if (condition) {
    tx["Condition"] = condition;
  }

  console.log("Submitting Transaction:", tx);

  try {
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`Ledger Error: ${result.result.meta.TransactionResult}`);
    }
    
    client.disconnect();
    return result.result;
  } catch (error) {
    client.disconnect();
    throw error;
  }
}

export const getGigEscrows = async (accountAddress) => {
  const client = await getClient();

  try {
    const response = await client.request({
      command: "account_objects",
      account: accountAddress,
      type: "escrow",
      ledger_index: "validated"
    });

    const rawObjects = response.result.account_objects;
    const enrichedEscrows = [];

    console.log(`Found ${rawObjects.length} raw objects. Fetching details...`);

    for (const obj of rawObjects) {
      try {
        if (obj.PreviousTxnID) {
          // Look up the transaction that created this escrow
          const txResponse = await client.request({
            command: "tx",
            transaction: obj.PreviousTxnID
          });

          // Verify we have a valid sequence
          const correctSequence = txResponse.result.Sequence;

          if (correctSequence !== undefined) {
            enrichedEscrows.push({
              // Normalize keys for frontend
              sequence: correctSequence, 
              amount: Number(obj.Amount) / 1000000,
              destination: obj.Destination,
              owner: obj.Account,
              condition: obj.Condition,
              previousTxnId: obj.PreviousTxnID
            });
          }
        }
      } catch (err) {
        console.warn("Skipping orphan escrow:", obj.index, err.message);
      }
    }

    return enrichedEscrows;

  } catch (error) {
    console.error("Fetch Escrows Error:", error);
    return [];
  } finally {
    await client.disconnect();
  }
};