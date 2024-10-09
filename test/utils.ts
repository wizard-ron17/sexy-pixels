import {
  Number256,
  web3,
  hashMessage,
  ZERO_ADDRESS,
  SignerProvider,
  Token,
  Address,
  ONE_ALPH,
  waitForTxConfirmation,
  MINIMAL_CONTRACT_DEPOSIT,
  DUST_AMOUNT
} from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { testPrivateKey } from '@alephium/web3-test'

import { PixelFactory } from '../artifacts/ts'

web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)

// From https://docs.alephium.org/dapps/constants
export const MAX_GAS_PER_TX = ONE_ALPH / 2n
export const MAX_EXECUTION_FEE_PER_TX = ONE_ALPH // Unsure

export const defaultSigner = new PrivateKeyWallet({
  privateKey: testPrivateKey
})

export const DEFAULT_ALPH_AMOUNT_RANDOM_SIGNER = 100n * ONE_ALPH
export async function getRandomSigner(group?: number): Promise<PrivateKeyWallet> {
  const pkWallet = PrivateKeyWallet.Random(group)
  await transferAlphTo(pkWallet.address, DEFAULT_ALPH_AMOUNT_RANDOM_SIGNER)
  return pkWallet
}

export async function deployPixelFactory(signer: SignerProvider) {
  return await PixelFactory.deploy(signer, {
    initialFields: {
      maxX: 4n,
      maxY: 4n
    },
    initialAttoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
  })
}

export async function transferTokenTo(to: Address, tokenId: string, amount: bigint) {
  const tx = await defaultSigner.signAndSubmitTransferTx({
    signerAddress: defaultSigner.address,
    destinations: [
      {
        address: to,
        attoAlphAmount: DUST_AMOUNT,
        tokens: [{ id: tokenId, amount }]
      }
    ]
  })
  return waitForTxConfirmation(tx.txId, 1, 1000)
}

export const balanceOf = async (address: string): Promise<Token[]> => {
  const balances = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(address)
  const tokenBalances = balances.tokenBalances
  return tokenBalances === undefined
    ? []
    : tokenBalances.map((t) => {
        return { id: t.id, amount: BigInt(t.amount) }
      })
}

// Functions belows are taken from PredictAlph test suite
// https://github.com/notrustverify/predictalph-contracts/blob/predictionv2/test/utils.ts

export const alphBalanceOf = async (address: string): Promise<bigint> => {
  const balances = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(address)
  const balance = balances.balance
  return balance === undefined ? 0n : BigInt(balance)
}

export async function transferAlphTo(to: Address, amount: bigint) {
  const tx = await defaultSigner.signAndSubmitTransferTx({
    signerAddress: defaultSigner.address,
    destinations: [{ address: to, attoAlphAmount: amount }]
  })
  return waitForTxConfirmation(tx.txId, 1, 1000)
}

export function cartesianToByteVec(x: number, y: number) {
  const buffer = Buffer.alloc(2 * 4) // 4 bytes for x, 4 bytes for y
  buffer.writeUInt32BE(x, 0)
  buffer.writeUInt32BE(y, 4)

  return buffer.toString('hex')
}
