import { contractFactory, getIndexFromCoordinates } from "@/services/utils";
import { Address, hexToString } from "@alephium/web3";
import { PixelFactoryTypes } from "my-contracts";
import React, { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
import styles from '../styles/Activity.module.css';

interface CallerCount {
  address: string;
  count: number;
}

export const ActivityEvents = ({ }) => {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<(PixelFactoryTypes.PixelSetEvent | PixelFactoryTypes.PixelResetEvent)[]>([]);
  const [callerCounts, setCallerCounts] = useState<CallerCount[]>([]);

  const updateCallerCounts = (caller: string, txId: string) => {
    setCallerCounts(prevCounts => {
      const existingEvent = events.some(e => e.txId === txId);
      if (existingEvent) {
        return prevCounts;
      }

      const existingCaller = prevCounts.find(c => c.address === caller);
      if (existingCaller) {
        return prevCounts
          .map(c => c.address === caller ? { ...c, count: c.count + 1 } : c)
          .sort((a, b) => b.count - a.count);
      } else {
        return [...prevCounts, { address: caller, count: 1 }]
          .sort((a, b) => b.count - a.count);
      }
    });
  };

  useEffect(() => {
    async function subscribeEvent() {
      contractFactory.subscribeAllEvents({
        pollingInterval: 1000,
        messageCallback: async (
          event:
            | PixelFactoryTypes.PixelSetEvent
            | PixelFactoryTypes.PixelResetEvent
        ): Promise<void> => {
          console.log("got new event:", event);
          
          setEvents(prevEvents => {
            const isDuplicate = prevEvents.some(e => e.txId === event.txId);
            if (isDuplicate) {
              return prevEvents; // Return unchanged if duplicate
            }

            if(event.name === 'PixelSet')
              updateCallerCounts(event.fields.caller, event.txId);
          
            return [...prevEvents, event];
          });
          
          return Promise.resolve();
        },
        errorCallback: (error: any, subscription: { unsubscribe: () => void; }): Promise<void> => {
          console.error("Error received:", error);
          setError(error.message);
          subscription.unsubscribe();
          return Promise.resolve();
        },
      });
    }
    subscribeEvent();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.leaderboard}>
        <h2 className={styles.leaderboardTitle}>Top 10 Minters</h2>
        <div className={styles.leaderboardList}>
          {callerCounts.slice(0, 10).map((caller, index) => (
            <div key={caller.address} className={styles.leaderboardItem}>
              <span className={styles.rank}>#{index + 1}</span>
              <span className={styles.address}>
                {caller.address.slice(0, 6)}...{caller.address.slice(-4)}
              </span>
              <span className={styles.count}>{caller.count} mints</span>
            </div>
          ))}
        </div>
      </div>

      
      <div className="activity-list">
        {error && <div className="error">{error}</div>}
        <h3>Recent Activity</h3>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              {event.name === 'PixelSet' 
                ? `Pixel Set Block:  ${event.blockHash} / caller: ${(event.fields as {caller: Address}).caller} / color: #${hexToString((event.fields as {color: string}).color)} / x: ${Number(event.fields.x)} y: ${Number(event.fields.y)}`
                : `Pixel Reset Block: ${event.blockHash} / caller: ${(event.fields as {caller: Address}).caller} / minter of the pixel: ${(event.fields as {firstMinter: Address}).firstMinter} / x: ${Number(event.fields.x)} y: ${Number(event.fields.y)}`
              }
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
