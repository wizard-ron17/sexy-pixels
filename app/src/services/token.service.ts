import { DUST_AMOUNT, ExecuteScriptResult, MINIMAL_CONTRACT_DEPOSIT, SignerProvider, stringToHex } from '@alephium/web3'
import { contractFactory } from './utils'

export const mintPx = async (signerProvider: SignerProvider, amount: string, tokenId: string, x: number, y: number, color: string): Promise<ExecuteScriptResult> => {

   console.log(x,y,color)
   return await contractFactory.transact.setPixel({
      args: {
         x: BigInt(x),
         y: BigInt(y),
         color: stringToHex(color.split('#')[1]),
         amountFees: 0n
      },
      signer: signerProvider,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT+DUST_AMOUNT
   })
   
 }

