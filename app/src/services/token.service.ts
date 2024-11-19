import { DUST_AMOUNT, ExecuteScriptResult, MINIMAL_CONTRACT_DEPOSIT, SignerProvider, stringToHex } from '@alephium/web3'
import { contractFactory } from './utils'

export const mintPx = async (signerProvider: SignerProvider, tokenId: string, x: number, y: number, color: string,amountToBurn: bigint): Promise<ExecuteScriptResult> => {

   return await contractFactory.transact.setPixel({
      args: {
         x: BigInt(x),
         y: BigInt(y),
         color: stringToHex(color.split('#')[1]),
         amountToBurn: amountToBurn
      },
      signer: signerProvider,
      tokens:[{
         id: tokenId,
         amount: amountToBurn
      }],
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT+DUST_AMOUNT
   })
   
 }


 export const resetPx = async (signerProvider: SignerProvider, tokenId: string, x: number, y: number, color: string,amountToBurn: bigint): Promise<ExecuteScriptResult> => {

   return await contractFactory.transact.resetPixel({
      args: {
         x: BigInt(x),
         y: BigInt(y)
      },
      signer: signerProvider,
      attoAlphAmount: 3n*DUST_AMOUNT
   })
   
}

