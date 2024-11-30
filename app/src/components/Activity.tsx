import { contractFactory, getIndexFromCoordinates } from "@/services/utils";
import { Address, hexToString } from "@alephium/web3";
import { PixelFactoryTypes } from "my-contracts";
import React, { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
import styles from '../styles/Activity.module.css';
import { ANS } from "@alph-name-service/ans-sdk";

interface CallerCount {
  address: string;
  count: number;
}


export const ActivityEvents: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<(PixelFactoryTypes.PixelSetEvent | PixelFactoryTypes.PixelResetEvent)[]>([]);
  const [callerCounts, setCallerCounts] = useState<CallerCount[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [ansNames, setAnsNames] = useState<{ [key: string]: string }>({});
  const [ansUris, setAnsUris] = useState<{ [key: string]: string }>({});

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

  const fetchAnsProfile = async (address: string) => {
    try {
      const ans = new ANS('mainnet', false, (process.env.NODE_URL as string) ??
      "https://fullnode-testnet.alephium.notrustverify.ch");
      const profile = await ans.getProfile(address);
      if (profile?.name) {
        setAnsNames(prev => ({ ...prev, [address]: profile.name }));
      }
      if (profile?.imgUri) {
        setAnsUris(prev => ({ ...prev, [address]: profile.imgUri }));
      }
    } catch (error) {
      console.error('Error fetching ANS:', error);
    }
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const uniqueCallers = Array.from(new Set(callerCounts.map(c => c.address)));
    uniqueCallers.forEach(caller => fetchAnsProfile(caller));
  }, [callerCounts]);

  useEffect(() => {
    const uniqueEvents = Array.from(new Set(events.map(event => event.fields.caller)));
    uniqueEvents.forEach(caller => fetchAnsProfile(caller));
  }, [events]);

  const formatAddress = (address: string, isMobile: boolean) => {
    return isMobile ? 
      `${address.slice(0, 6)}...${address.slice(-4)}` : 
      address;
  };

  return (
    <div className={styles.container}>
      <div className={styles.leaderboard}>
        <div className={styles.leaderboardHeader}>
          <h2 className={styles.leaderboardTitle}>
            Top 10 Minters
          </h2>
          <a href="https://www.alephium.domains/dashboard" target="_blank" rel="noopener noreferrer" className={styles.getNameButton}>
            <img src="https://github.com/alephium/token-list/raw/master/logos/ANSd.png" alt="ANS Logo" className={styles.ansLogo} />
            Get a name
          </a>
        </div>
        <div className={styles.leaderboardList}>
          {callerCounts.slice(0, 10).map((caller, index) => (
            <div key={caller.address} className={styles.leaderboardItem}>
              <span className={styles.rank}>#{index + 1}</span>
              <span className={styles.address}>
                {ansNames[caller.address] || formatAddress(caller.address, isMobile)}
              </span>
              <span className={styles.count}>{caller.count} mints</span>
            </div>
          ))}
        </div>
      </div>

      
      <div className={styles.activityList}>
        {error && <div className="error">{error}</div>}
        <h3>Recent Activity</h3>
        <div className={styles.activityCards}>
          {events.slice().reverse().map((event, index) => (
            <div key={index} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                <span 
                  className={styles.eventType} 
                  style={{ 
                    color: event.name === 'PixelSet' ? 
                           (event.fields as { isShiny?: boolean }).isShiny ? 'gold' : '#00ff00' : 
                           event.name === 'PixelReset' ? 'red' : 'inherit'
                  }}
                >
                  {event.name === 'PixelSet' && (event.fields as { isShiny?: boolean }).isShiny ? '✨ Shiny Pixel Set' : 
                   event.name === 'PixelSet' ? '🎨 Pixel Set' : 
                   '🔄 Pixel Reset'}
                </span>
                <span className={styles.timestamp}>
                  Block: {isMobile ? 
                    `${event.blockHash.slice(0, 8)}...` : 
                    event.blockHash}
                </span>
              </div>
              <div className={styles.activityDetails}>
                <div className={styles.addressRow}>
                  <span className={styles.label}>Caller:</span>
                  <span className={styles.address}>
                    {ansNames[(event.fields as { caller: Address }).caller] || formatAddress((event.fields as { caller: Address }).caller, isMobile)}
                  </span>
                </div>
                {event.name === 'PixelSet' ? (
                  <div className={styles.colorRow}>
                    <span className={styles.label}>Color:</span>
                    <span className={styles.colorBox} style={{backgroundColor: `#${hexToString((event.fields as {color: string}).color)}`}}></span>
                    <span>#{hexToString((event.fields as {color: string}).color)}</span>
                  </div>
                ) : (
                  <div className={styles.addressRow}>
                    <span className={styles.label}>Original Minter:</span>
                    <span className={styles.address}>
                      {ansNames[(event.fields as { firstMinter: Address }).firstMinter] || formatAddress((event.fields as { firstMinter: Address }).firstMinter, isMobile)}
                    </span>
                  </div>
                )}
                <div className={styles.coordRow}>
                  <span className={styles.label}>Coordinates:</span>
                  <span>x: {Number(event.fields.x)}, y: {Number(event.fields.y)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
