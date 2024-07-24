import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet';

export async function signAndSubmitTransfer(recipientAddress, amount) {
  try {
    const windowAlephium = await getDefaultAlephiumWallet();
    const selectedAccount = await windowAlephium?.enable();

    if (windowAlephium && selectedAccount) {
      const transferParams = {
        from: selectedAccount,
        to: '1BnqNgjm6FxBJ1kBJLxfFT49jKyGCJH4d3MqByWgU4eM3', // ALPH Trading Bot Wallet
        amount: '1000000000000000000', // Amount should be in attoAleph
      };

      const result = await windowAlephium.signAndSubmitTransferTx(transferParams);
      console.log('Transaction result:', result);
      return result;
    } else {
      console.error('Failed to connect to Alephium wallet or select account');
      return null;
    }
  } catch (error) {
    console.error('Error signing and submitting transfer:', error);
    return null;
  }
}
