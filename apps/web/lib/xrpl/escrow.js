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

export const createGigEscrow = async (seed, details) => {
  const client = await getClient();
  
  try {
    const { amount, destination, condition, deadlineInSeconds = 3600 } = details;
    const wallet = Wallet.fromSeed(seed);
    
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + deadlineInSeconds);
    const cancelAfterRipple = isoTimeToRippleTime(expiryDate.toISOString());

    // 1. Prepare
    const tx = {
      TransactionType: "EscrowCreate",
      Account: wallet.address,
      Amount: xrpToDrops(amount),
      Destination: destination,
      CancelAfter: cancelAfterRipple,
      Condition: condition,
    };

    // 2. Autofill with explicit buffer to prevent timeouts
    const prepared = await client.autofill(tx);
    const ledgerIndex = await client.getLedgerIndex();
    prepared.LastLedgerSequence = ledgerIndex + 50; // Give it 50 ledgers (~3 mins) buffer

    // 3. Sign & Submit
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    // 4. Robust Sequence Extraction
    const sequence = result.result.Sequence || result.result.tx_json?.Sequence;

    if (!sequence) {
      throw new Error("Transaction succeeded but Sequence number could not be found.");
    }

    return {
      success: true,
      sequence: sequence,
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

export const finishGigEscrow = async (seed, details) => {
  const client = await getClient();

  try {
    const { ownerAddress, sequence, condition, fulfillment } = details;
    const wallet = Wallet.fromSeed(seed);

    if (!sequence || isNaN(parseInt(sequence))) {
      throw new Error(`Invalid Sequence Number: ${sequence}`);
    }

    // 1. Prepare
    const tx = {
      TransactionType: "EscrowFinish",
      Account: wallet.address, 
      Owner: ownerAddress,     
      OfferSequence: parseInt(sequence),
      Condition: condition,
      Fulfillment: fulfillment,
    };

    // 2. Autofill with explicit buffer to prevent timeouts (FIX for temMALFORMED)
    const prepared = await client.autofill(tx);
    const ledgerIndex = await client.getLedgerIndex();
    prepared.LastLedgerSequence = ledgerIndex + 50; // Increased buffer

    // 3. Sign & Submit
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`Claim Failed: ${result.result.meta.TransactionResult}`);
    }

    return { 
      success: true,
      txHash: result.result.hash
    };
  } catch (error) {
    console.error("Claim Error:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
};

export const getGigEscrows = async (accountAddress) => {
  const client = await getClient();

  try {
    console.log("Scanning ledger for escrows..."); 

    const response = await client.request({
      command: "account_objects",
      account: accountAddress,
      type: "escrow",
      ledger_index: "validated"
    });

    const rawObjects = response.result.account_objects;
    console.log(`Found ${rawObjects.length} raw objects.`); 

    const enrichedEscrows = [];

    for (const obj of rawObjects) {
      try {
        if (obj.PreviousTxnID) {
          const txResponse = await client.request({
            command: "tx",
            transaction: obj.PreviousTxnID
          });

          // Check all possible places for Sequence
          const correctSequence = 
            txResponse.result.Sequence || 
            txResponse.result.tx_json?.Sequence ||
            obj.Sequence; 

          if (correctSequence) {
            enrichedEscrows.push({
              sequence: correctSequence,
              amount: Number(obj.Amount) / 1000000,
              destination: obj.Destination,
              owner: obj.Account,
              condition: obj.Condition,
              finishAfter: obj.FinishAfter, 
              cancelAfter: obj.CancelAfter
            });
          }
        }
      } catch (err) {
        console.warn("Failed to lookup tx for escrow:", obj, err);
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