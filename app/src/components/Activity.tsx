import { contractFactory, getIndexFromCoordinates } from "@/services/utils";
import { Address, hexToString } from "@alephium/web3";
import { PixelFactoryTypes } from "my-contracts";
import React, { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";

export const ActivityEvents = ({ }) => {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<(PixelFactoryTypes.PixelSetEvent | PixelFactoryTypes.PixelResetEvent)[]>([]);

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
          setEvents(prevEvents => [...prevEvents, event]);
          return Promise.resolve();
        },
        errorCallback: (error: any, subscription): Promise<void> => {
          console.error("Error received:", error);
          setError(error.message); // Update state with error info
          subscription.unsubscribe();
          return Promise.resolve();
        },
      });
    }
    subscribeEvent();
  }, []);

  return (
    <div>
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
  );
};
