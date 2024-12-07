import React, { useEffect } from 'react';
import { PixelFactoryTypes } from 'my-contracts';
import { alphBalanceOf, balanceOf, Token } from '@/services/utils';
import styles from '../styles/Stats.module.css';

interface StatsDisplayProps {
  contractState: PixelFactoryTypes.State;
  tokenMetadata?: Token;
  gridSize: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> =  ({
  contractState,
  tokenMetadata,
  gridSize,
}) => {
    const [burnRatio, setBurnRatio] = React.useState<number>(1);
    const [exPrice, setExPrice] = React.useState<number>(0);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=elexium&vs_currencies=usd');
                const data = await response.json();
                setExPrice(data['elexium'].usd);
            } catch (error) {
                console.error('Failed to fetch EX price:', error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 600000); // Update price every minute

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchBalances = async () => {
            const [ex, sexy] = await Promise.all([
                balanceOf("275YMYo21Hw4REEY2SXhweMHTXSpAP9dBUUGNtwGGX3SF", "cad22f7c98f13fe249c25199c61190a9fb4341f8af9b1c17fcff4cd4b2c3d200") as Promise<bigint>,
                balanceOf("275YMYo21Hw4REEY2SXhweMHTXSpAP9dBUUGNtwGGX3SF", contractState.fields.tokenIdToBurn) as Promise<bigint>
            ]);
                  setBurnRatio(Number(ex)/Number(sexy));

        };
        fetchBalances();
    }, [])


  return (
    <div className={styles.statsContainer}>
      <span>
      <img
              src="https://i.gifer.com/origin/a9/a95ef9bce2a1d53accc6a8018df04ff6_w200.gif"
              alt="fire"
              className={styles.fireIcon}
              style={{ width: '16px', height: '16px' }}  
            /> Total Burned: {tokenMetadata !== undefined ? (
          <>
            {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(
              Math.floor(
                Number(contractState.fields.balanceBurn) /
                10 ** tokenMetadata.decimals
              )
            )} {tokenMetadata.symbol} 
            {exPrice > 0 && (
              <span>
                (≈ ${((Number(contractState.fields.balanceBurn) /
                    10 ** tokenMetadata.decimals
                ) * burnRatio * exPrice).toFixed(2)} USD)
              </span>
            )}
            
          </>
        ) : (
          0
        )} | 
        Pixels Minted: {Number(contractState.fields.numPxMinted)} / {gridSize * gridSize}
      </span>
    </div>
  );
}; 