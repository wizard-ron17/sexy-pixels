import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { PixelFactory } from '../artifacts/ts'
import { ALPH_TOKEN_ID, ONE_ALPH, stringToHex } from '@alephium/web3'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(PixelFactory, {
     initialFields: {
        maxX: 69n,
        maxY: 69n,
        burnMint: 690n * 10n**18n,
        tokenIdToBurn: "b067767804137fa913fe30a26a7c5f397faba36aaa7b9650327ae4e6e9305d00",
        numPxMinted: 0n,
        balanceBurn: 0n
     }
  })
  console.log('Token faucet contract id: ' + result.contractInstance.contractId)
  console.log('Token faucet contract address: ' + result.contractInstance.address)
}

export default deployFaucet
