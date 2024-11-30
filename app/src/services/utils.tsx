import { useState, useEffect } from 'react';
import { hexToString, NetworkId, web3 } from "@alephium/web3";
import { PixelFactoryTypes } from "my-contracts";
import { loadDeployments } from "my-contracts/deployments";


export interface TokenList {
  networkId: number;
  tokens: Token[];
}

web3.setCurrentNodeProvider(
  (process.env.NEXT_PUBLIC_NODE_URL as string) ??
    "https://fullnode-testnet.alephium.notrustverify.ch",
  undefined,
  undefined
);

export interface Token {
   id: string
   name: string
   symbol: string
   decimals: number
   description: string
   logoURI: string
   nameOnChain?: string
   symbolOnChain?: string
 }


export interface TokenFaucetConfig {
  network: NetworkId;
  groupIndex: number;
  tokenFaucetAddress: string;
  faucetTokenId: string;
}

function getNetwork(): NetworkId {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? "testnet") as NetworkId;
  return network;
}

export const contractFactory = loadDeployments(getNetwork()).contracts
  .PixelFactory.contractInstance;

export const gridSize = 50;

function getTokenFaucetConfig(): TokenFaucetConfig {
  const network = getNetwork();
  const tokenFaucet =
    loadDeployments(network).contracts.PixelFactory.contractInstance;
  const groupIndex = tokenFaucet.groupIndex;
  const tokenFaucetAddress = tokenFaucet.address;
  const faucetTokenId = tokenFaucet.contractId;
  return { network, groupIndex, tokenFaucetAddress, faucetTokenId };
}

export async function subscribeEvent() {
  contractFactory.subscribePixelSetEvent({
    pollingInterval: 500,
    messageCallback: (
      event: PixelFactoryTypes.PixelSetEvent
    ): Promise<void> => {
      console.log("got admin updated event:", event);
      return Promise.resolve();
    },
    errorCallback: (error: any, subscription): Promise<void> => {
      console.log(error);
      subscription.unsubscribe();
      return Promise.resolve();
    },
  });
}

export async function getPx() {
  const predefinedPixelColors: { [key: number]: string } = {};
  const px = contractFactory.maps.pixels;

  // Function to chunk the grid into 10x10 blocks (each block contains 100 pixels)
  const chunkGrid = () => {
    const blocks: { x: number; y: number }[] = [];

    // Create chunks of 10x10 blocks
    for (let x = 1; x <= gridSize; x += 10) {
      for (let y = 1; y <= gridSize; y += 10) {
        blocks.push({ x, y });
      }
    }
    return blocks;
  };

  // Function to handle fetching pixels for a specific block
  const fetchBlockPixels = async (block: { x: number; y: number }) => {
    const blockPromises = [];

    // For each pixel in the 10x10 block
    for (let x = block.x; x < block.x + 10; x++) {
      for (let y = block.y; y < block.y + 10; y++) {
        // Add the promise to fetch the pixel color
        blockPromises.push(
          px.get(cartesianToByteVec(Number(x), Number(y))).then((pxSet) => {
            const index = getIndexFromCoordinates(x, y);
            if (pxSet !== undefined) {
              predefinedPixelColors[index] = `#${hexToString(pxSet.color)}`;
            }
          })
        );
      }
    }

    // Wait for all promises in the block to complete
    await Promise.all(blockPromises);
  };

  // Get all blocks (chunks of 10x10)
  const blocks = chunkGrid();

  // Process each block sequentially, but each block's pixels in parallel
  for (const block of blocks) {
    await fetchBlockPixels(block); // Wait for the current block to finish before moving to the next one
  }


  // Return the final grid with updated colors
  return Array(gridSize * gridSize)
    .fill("#333")
    .map((defaultColor, index) => predefinedPixelColors[index] || defaultColor);
}

export const getIndexFromCoordinates = (x: number, y: number) => {
  const index = y * gridSize + x;
  return index;
};

export const getGridCoordinates = (index: number) => {
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);
  return [x, y];
};

export function cartesianToByteVec(x: number, y: number) {
  const buffer = Buffer.alloc(2 * 4); // 4 bytes for x, 4 bytes for y
  buffer.writeUInt32BE(x, 0);
  buffer.writeUInt32BE(y, 4);

  return buffer.toString("hex");
}

export async function getTokenList(): Promise<Token[]> {
  const url = `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${getNetwork()}.json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data: TokenList = await response.json(); // Ensure type assertion here
  return data.tokens; // Correctly returning the value
}

export const tokenFaucetConfig = getTokenFaucetConfig();
