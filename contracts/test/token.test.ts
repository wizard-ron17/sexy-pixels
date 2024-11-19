import {
  web3,
  DUST_AMOUNT,
  ONE_ALPH,
  MINIMAL_CONTRACT_DEPOSIT,
  ZERO_ADDRESS,
  stringToHex,
  Token,
  ALPH_TOKEN_ID,
  waitForTxConfirmation
} from '@alephium/web3'
import { expectAssertionError, mintToken } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

import {
  alphBalanceOf,
  balanceOf,
  cartesianToByteVec,
  DEFAULT_ALPH_AMOUNT_RANDOM_SIGNER,
  defaultSigner,
  deployPixelFactory,
  getRandomSigner,
  transferTokenTo
} from './utils'
import { PixelFactory } from '../artifacts/ts'

jest.setTimeout(10 * 1000)
describe('integration tests', () => {
  const defaultGroup = 0

  let creator: PrivateKeyWallet
  let receiver: PrivateKeyWallet
  let attacker: PrivateKeyWallet

  beforeEach(async () => {
    creator = await getRandomSigner(defaultGroup)
    receiver = await getRandomSigner(defaultGroup)

    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  describe('deployment', () => {
    it('should deploy and have balance', async () => {
      const alphAmount = 10n * ONE_ALPH
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      const state = await PixelFactory.at(factory.address).fetchState()
      expect(state.asset.alphAmount).toEqual(MINIMAL_CONTRACT_DEPOSIT)
    })
  })

  describe('pixel interaction', () => {
    it('set new pixel', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await factory.fetchState()

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      state = await factory.fetchState()

      const px = factory.maps.pixels

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)
      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.color).toBe(stringToHex('a3ffb4'))
    })

    it('set new pixel and reset it', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      const px = factory.maps.pixels

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)

      await factory.transact.resetPixel({
        args: {
          x: x,
          y: y
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
      })

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(false)
    })

    it('set new pixel and replace it', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 0n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      state = await PixelFactory.at(factory.address).fetchState()

      let px = PixelFactory.at(factory.address).maps.pixels
      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb3'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      state = await factory.fetchState()

      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.color).toBe(stringToHex('a3ffb3'))
      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.firstMinter).toBe(creator.address)

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)
    })

    it('should test x outside the grid', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 7n
      const y = 2n

      expectAssertionError(
        factory.transact.setPixel({
          args: {
            x: x,
            y: y,
            color: stringToHex('a3ffb4'),
            amountToBurn: 2n * ONE_ALPH
          },
          signer: creator,
          attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
        }),
        factory.address,
        0
      )
    })

    it('should test y outside the grid', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 2n
      const y = 5n

      expectAssertionError(
        factory.transact.setPixel({
          args: {
            x: x,
            y: y,
            color: stringToHex('a3ffb4'),
            amountToBurn: 2n * ONE_ALPH
          },
          signer: creator,
          attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
        }),
        factory.address,
        0
      )
    })

    it('should not increase numPX', async () => {
      const contractResult = await deployPixelFactory(defaultSigner, ALPH_TOKEN_ID, 0n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      state = await PixelFactory.at(factory.address).fetchState()
      expect(state.fields.numPxMinted).toEqual(1n)

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb2'),
          amountToBurn: 2n * ONE_ALPH
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * ONE_ALPH
      })

      state = await PixelFactory.at(factory.address).fetchState()
      expect(state.fields.numPxMinted).toEqual(1n)
    })
  })

  describe('pixel interaction with custom token', () => {
    
   it('set new pixel', async () => {

      const customToken = await mintToken(creator.address, 1000n)

      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 2n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await factory.fetchState()

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 2n
        },
        signer: creator,
        tokens:[{
           id: customToken.tokenId,
           amount: 2n
        }],
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
      })

      state = await factory.fetchState()

      const px = factory.maps.pixels

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)
      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.color).toBe(stringToHex('a3ffb4'))
      expect(state.fields.balanceBurn).toEqual(2n)


      await factory.transact.setPixel({
         args: {
           x: 1n,
           y: 0n,
           color: stringToHex('a3ffb4'),
           amountToBurn: 2n
         },
         signer: creator,
         tokens:[{
            id: customToken.tokenId,
            amount: 2n
         }],
         attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
       })
       
       state = await factory.fetchState()
      expect(state.fields.balanceBurn).toEqual(4n)

    })


    it('set new pixel with not enough tokens to burn', async () => {

      const customToken = await mintToken(creator.address, 1000n)

      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 3n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await factory.fetchState()

      const x = 2n
      const y = 3n


      expectAssertionError(
         factory.transact.setPixel({
            args: {
              x: x,
              y: y,
              color: stringToHex('a3ffb4'),
              amountToBurn: 2n
            },
            signer: creator,
            tokens:[{
               id: customToken.tokenId,
               amount: 2n
            }],
            attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
          }),
         factory.address,
         2
       )

    })

    it('set new pixel and reset it', async () => {
      const customToken = await mintToken(creator.address, 1000n)
      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 1n)

      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      const px = factory.maps.pixels

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 1n
        },
        signer: creator,
        tokens:[{
         id: customToken.tokenId,
         amount: 1n
      }],
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
      })

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)

      await factory.transact.resetPixel({
        args: {
          x: x,
          y: y
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
      })

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(false)

    })

    it('set new pixel and replace it', async () => {
      const customToken = await mintToken(creator.address, 1000n)
      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 1n)

      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 0n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 1n
        },
        signer: creator,
        tokens:[{
         id: customToken.tokenId,
         amount: 1n
      }],
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
      })

      state = await PixelFactory.at(factory.address).fetchState()

      let px = PixelFactory.at(factory.address).maps.pixels
      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb3'),
          amountToBurn: 1n
        },
        signer: creator,
        tokens:[{
         id: customToken.tokenId,
         amount: 1n
      }],
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
      })

      state = await factory.fetchState()

      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.color).toBe(stringToHex('a3ffb3'))
      expect((await px.get(cartesianToByteVec(Number(x), Number(y))))?.firstMinter).toBe(creator.address)

      expect(await px.contains(cartesianToByteVec(Number(x), Number(y)))).toEqual(true)
    })

    it('should test x outside the grid', async () => {
      const customToken = await mintToken(creator.address, 1000n)
      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 1n)
      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 7n
      const y = 2n

      expectAssertionError(
        factory.transact.setPixel({
          args: {
            x: x,
            y: y,
            color: stringToHex('a3ffb4'),
            amountToBurn: 1n
          },
          tokens:[{
            id: customToken.tokenId,
            amount: 1n
         }],
          signer: creator,
          attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
        }),
        factory.address,
        0
      )
    })

    it('should test y outside the grid', async () => {
      const customToken = await mintToken(creator.address, 1000n)
      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 1n)

      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 2n
      const y = 5n

      expectAssertionError(
        factory.transact.setPixel({
          args: {
            x: x,
            y: y,
            color: stringToHex('a3ffb4'),
            amountToBurn: 1n
          },
          tokens:[{
            id: customToken.tokenId,
            amount: 1n
         }],
          signer: creator,
          attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
        }),
        factory.address,
        0
      )
    })

    it('should not increase numPX', async () => {
      const customToken = await mintToken(creator.address, 1000n)
      const contractResult = await deployPixelFactory(defaultSigner, customToken.contractId, 0n)

      expect(contractResult).toBeDefined()
      const factory = contractResult.contractInstance

      let state = await PixelFactory.at(factory.address).fetchState()

      const x = 2n
      const y = 3n

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb4'),
          amountToBurn: 0n
        },
        tokens:[{
         id: customToken.tokenId,
         amount: 1n
      }],
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      })

      state = await PixelFactory.at(factory.address).fetchState()
      expect(state.fields.numPxMinted).toEqual(1n)

      await factory.transact.setPixel({
        args: {
          x: x,
          y: y,
          color: stringToHex('a3ffb2'),
          amountToBurn: 0n
        },
        signer: creator,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      })

      state = await PixelFactory.at(factory.address).fetchState()
      expect(state.fields.numPxMinted).toEqual(1n)

      
    })
  })
})
