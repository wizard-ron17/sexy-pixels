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
      <div className={styles.statBox}>
        <div className={styles.statLabel}>Minted</div>
        <div className={styles.statValue}>
          {Number(contractState.fields.numPxMinted)} / {gridSize * gridSize}
        </div>
      </div>
      <div className={styles.statBox}>
        <div className={styles.statLabel}>Burned</div>
        <div className={styles.statValue}>
          {tokenMetadata !== undefined ? (
            <>
              {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(
                Math.floor(
                  Number(contractState.fields.balanceBurn) /
                  10 ** tokenMetadata.decimals
                )
              )}{' '}
              {tokenMetadata.symbol}
              <img
                src="https://i.gifer.com/origin/a9/a95ef9bce2a1d53accc6a8018df04ff6_w200.gif"
                alt="fire"
                className={styles.fireIcon}
              />
            </>
          ) : (
            0
          )}
          <small>
          <div>
            {tokenMetadata && (
              <>
                ~ {((Number(contractState.fields.balanceBurn) /
                  10 ** tokenMetadata.decimals
                ) * burnRatio).toFixed(2)} EX
              </>
            )}
          </div>
          </small>
        </div>
      </div>
    </div>
  );
}; 