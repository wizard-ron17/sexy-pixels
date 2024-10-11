import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { PixelFactory } from '../artifacts/ts'
import { ONE_ALPH, stringToHex } from '@alephium/web3'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFactory: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {



  const result = await deployer.deployContract(PixelFactory, {
    initialFields: {
       maxX: 4n,
       maxY: 4n,
       balance: 0n,
       feesMint: 2n*ONE_ALPH,
       numPxMinted: 0n
    }
  })
  console.log('Pixel factory contract id: ' + result.contractInstance.contractId)
  console.log('Pixel factory contract address: ' + result.contractInstance.address)
}

export default deployFactory
