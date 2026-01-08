# 🤝 GigSecure - Decentralized Freelancing Platform

> A trustless gig marketplace powered by the XRP Ledger (XRPL) Escrow features.

![Project Status](https://img.shields.io/badge/Status-Prototype-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-XRPL_Testnet-black)
![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB)

## 📖 Overview

**GigSecure** solves the issue of trust between Freelancers and Clients. In traditional freelancing, freelancers worry about non-payment, and clients worry about poor-quality work.

This application uses **XRPL Escrows** to hold funds cryptographically. The funds are locked on the blockchain and can only be released when the Client provides a "Secret Key" (Fulfillment) to the Freelancer, signifying that the work has been approved.

## 💼 Business Potential & Market Fit

GigSecure addresses critical inefficiencies in the $455B gig economy.
- **Disrupting the 20% Fee Model:** Traditional platforms like Upwork or Fiverr charge 10-20% commission. By utilizing the XRPL, our platform operates with transaction fees of fractions of a cent (<$0.0001), allowing freelancers to keep **100%** of their earnings.
- **Solving Cross-Border Payments:** International freelancers often lose 3-5% in forex conversion and wait days for wire transfers. XRPL settles in 3-5 seconds with built-in liquidity, making this platform ideal for a global workforce.
- **Trustless Architecture:** We eliminate the need for a central authority to hold funds. This reduces liability and operational costs, allowing for a lean, scalable business model.

## 💰 Future Revenue Model

While the core protocol is open, revenue can be generated through:
- **Arbiter Services:** A premium dispute resolution service where a third-party keyholder helps resolve conflicts for a small fee (not in MVP).
- **Featured Listings:** Clients pay a small amount in XRP to boost their gig visibility (not in MVP).
- **Identity Verification:** Premium "Verified Freelancer" badges backed by on-chain reputation (not in MVP).

## ✨ Key Features

- **Create Escrow:** Clients can post jobs with a specific reward (in XRP).
- **Secure Escrow:** Funds are locked on the XRP Ledger immediately upon gig creation—proving the client has the money.
- **Crypto-Condition Logic:** Utilizing SHA-256 pre-image verification (Condition/Fulfillment) to secure payments.
- **Non-Custodial:** The platform never holds user keys; users sign transactions directly via their local wallet seed.
- **Real-time Status:** Visual indicators for Escrow creation and Claim status.

## 🛠 Tech Stack

- **Frontend:** React.js, Vite
- **Blockchain Integration:** `xrpl.js` (Client-side SDK)
- **Network:** XRPL Testnet (Altnet)
- **Styling:** CSS / Tailwind

## 🚀 How It Works (The Escrow Flow)

1.  **Initialization:** The Client posts a gig. Under the hood, a `CreateEscrow` transaction is submitted to the XRPL.
    - A **Condition** (Lock) is generated from a secret key.
    - The funds are moved from the Client's wallet to the Ledger's Escrow vault.
2.  **Work Phase:** The Freelancer sees the gig and starts working.
3.  **Submission:** The Freelancer submits the work off-chain (e.g., via email or GitHub).
4.  **Approval:** If the Client is satisfied, they share the **Secret Key (Fulfillment)** with the Freelancer.
5.  **Claiming:** The Freelancer enters the Secret Key into the UI. The app submits a `FinishEscrow` transaction. The Ledger verifies the key matches the lock, and funds are instantly transferred to the Freelancer.

## 💻 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Steps

1.  **Clone the repository in a new folder / directory**

    ```bash
    git clone https://github.com/DeFinitelyWinning/GigSecure
    cd GigSecure
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Configure Environment**
    - Ensure you have an internet connection to connect to `wss://s.altnet.rippletest.net:51233`.
    - No API keys are needed for the Testnet.

4.  **Run the application**
    ```bash
    pnpm dev
    ```
    Open your browser to `http://localhost:3000` (or the port shown in terminal).

## 🧪 Usage Guide

1.  **Login:** Enter a valid XRPL Testnet Seed (or generate one at [xrpl.org/resources/testnet-faucet](https://xrpl.org/resources/testnet-faucet)).
2.  **Create Escrow:** Click "Create Escrow," enter the reward amount and address of Freelancer. Copy the **Secret Key** provided—save this! You need it to unlock the funds later.
3.  **Switch Account:** Logout and login with a _different_ wallet (the Freelancer).
4.  **Claim Funds:** Select the gig. When prompted, enter the **Secret Key** (from Step 2).
5.  **Success:** Watch the wallet balance update in real-time.

## ⚠️ Troubleshooting

- **"Right side of assignment cannot be destructured":** This usually means the XRPL client failed to connect or the transaction details were passed incorrectly. Refresh the page to reset the connection.
- **"tecUNFUNDED_PAYMENT":** The test wallet is out of XRP. Go to the XRPL Faucet to top up.

## 🔮 Future Improvements

- **Integration with IPFS:** To store gig descriptions and deliverables in a decentralized manner.
- **Arbiter System:** Adding a third-party mediator multisig for dispute resolution.
- **Mainnet Launch:** Transitioning from Testnet to the real XRP Ledger.

## 🙌 Acknowledgements

- **Original template:** [Scaffold-XRP](https://www.google.com/search?q=https://github.com/Start-on-XRPL/scaffold-xrp).
- **XRPL Commons:** For documentation and tooling

## 👥 Contributors

- **Hasan Ahmed Nasif** - _Developer_
- **Max Lim Hao Yan** - _Developer_
- **Ravichandran Gokul** - _Developer_

---

_Built for NUS FinTech Summit 2026 at NUS._
