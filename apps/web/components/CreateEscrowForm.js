"use client";

import { TransactionForm } from "./TransactionForm";

export function CreateEscrowForm(props) {
  // For now just wrap your existing component; later you can specialize fields.
  return <TransactionForm {...props} />;
}
