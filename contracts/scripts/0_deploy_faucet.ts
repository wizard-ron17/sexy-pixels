import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { PixelFactory } from '../artifacts/ts'
import { stringToHex } from '@alephium/web3'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(PixelFactory, {
     initialFields: {
        maxX: 10n,
        maxY: 10n,
        feesMint: 0n,
        numPxMinted: 0n,
        balance: 0n
     }
  })
  console.log('Token faucet contract id: ' + result.contractInstance.contractId)
  console.log('Token faucet contract address: ' + result.contractInstance.address)
}

export default deployFaucet
