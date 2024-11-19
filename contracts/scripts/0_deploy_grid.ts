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
        maxX: 19n,
        maxY: 19n,
        burnMint: 1n * 10n**18n,
        tokenIdToBurn: "8e6877d8dee708506625a77d73f62210dce24564cfa9ec93c0df02f2ba519b00",
        numPxMinted: 0n,
        balanceBurn: 0n
     }
  })
  console.log('Token faucet contract id: ' + result.contractInstance.contractId)
  console.log('Token faucet contract address: ' + result.contractInstance.address)
}

export default deployFaucet
