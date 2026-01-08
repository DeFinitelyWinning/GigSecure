"use client";

export function WalletStatus({ wallet, onConnect }) {
  const connected = !!wallet?.address;

  if (!connected) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-slate-300">XRPL wallet not connected</p>
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-slate-600 text-xs hover:border-blue-500 hover:text-blue-400"
        >
          Connect XRPL wallet
        </button>
      </div>
    );
  }

  const short = wallet.address
    ? wallet.address.slice(0, 4) + "..." + wallet.address.slice(-4)
    : "";

  return (
    <div className="text-xs space-y-1">
      <p className="text-emerald-400 font-medium">XRPL WALLET CONNECTED</p>
      <p>
        Address:{" "}
        <span className="font-mono">
          {short}
        </span>
      </p>
      {wallet.balance && (
        <p>Balance: {wallet.balance} XRP (Testnet)</p>
      )}
      {wallet.lastTxHash && (
        <p className="truncate">
          Last tx:{" "}
          <span className="font-mono">
            {wallet.lastTxHash}
          </span>
        </p>
      )}
    </div>
  );
}
