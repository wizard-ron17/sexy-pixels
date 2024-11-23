import React, { useCallback, useEffect, useMemo } from "react";
import { FC, useState } from "react";
import gridStyles from "../styles/App.module.css";
import { TxStatus } from "./TxStatus";
import { useWallet } from "@alephium/web3-react";
import { hexToString, node, ONE_ALPH } from "@alephium/web3";
import {
  contractFactory,
  getGridCoordinates,
  getIndexFromCoordinates,
  getPx,
  getTokenList,
  gridSize,
  TokenFaucetConfig,
  Token,
  cartesianToByteVec,
} from "@/services/utils";
import { mintPx, resetPx } from "@/services/token.service";
import { PixelFactoryTypes } from "my-contracts";
import styles from "../styles/Stats.module.css";

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FFFF33",
  "#FF33FF",
  "#33FFFF",
  "#FFFFFF",
  "#000000",
  "#888888",
  "#FF8800",
  "#0088FF",
  "#00FF88",
  "#8800FF",
  "#FF0088",
  "#bf0404",
  "#008888",
];

export const TokenDapp: FC<{
  config: TokenFaucetConfig;
}> = ({ config }) => {
  const { signer, account } = useWallet();
  const addressGroup = config.groupIndex;
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [ongoingTxId, setOngoingTxId] = useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [contractState, setContractState] =
    useState<PixelFactoryTypes.State | null>(null);
  const [pixels, setPixels] = useState(Array(gridSize * gridSize).fill("#333"));
  const [loading, setLoading] = useState(true); // Loading state
  const [eventData, setEventData] =
    useState<PixelFactoryTypes.PixelSetEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<Token | undefined>();
  const [isResetModal, setIsResetModal] = useState(false);

  const txStatusCallback = useCallback(
    async (status: node.TxStatus, numberOfChecks: number): Promise<unknown> => {
      if (
        (status.type === "Confirmed" && numberOfChecks > 2) ||
        (status.type === "TxNotFound" && numberOfChecks > 3)
      ) {
        setOngoingTxId(undefined);
      }

      return Promise.resolve();
    },
    [setOngoingTxId]
  );

  useEffect(() => {
    async function subscribeEvent() {
      const px = contractFactory.maps.pixels;

      contractFactory.subscribePixelSetEvent({
        pollingInterval: 1000,
        messageCallback: async (
          event: PixelFactoryTypes.PixelSetEvent
        ): Promise<void> => {
          console.log("got new event:", event);

          const indexNewPx = getIndexFromCoordinates(
            Number(event.fields.x),
            Number(event.fields.y)
          );
          if (
            await px.contains(
              cartesianToByteVec(Number(event.fields.x), Number(event.fields.y))
            )
          ) {
            setPixels((prevPixels) => {
              const newPixels = [...prevPixels];
              newPixels[indexNewPx] = `#${hexToString(event.fields.color)}`;

              return newPixels;
            });
          }
          return Promise.resolve();
        },
        errorCallback: (error: any, subscription): Promise<void> => {
          console.error("Error received:", error);
          setError(error.message); // Update state with error info
          subscription.unsubscribe();
          return Promise.resolve();
        },
      });

      contractFactory.subscribePixelResetEvent({
        pollingInterval: 1000,
        messageCallback: async (
          event: PixelFactoryTypes.PixelResetEvent
        ): Promise<void> => {
          console.log("got reset updated event:", event);

          const indexNewPx = getIndexFromCoordinates(
            Number(event.fields.x),
            Number(event.fields.y)
          );
          if (
            !(await px.contains(
              cartesianToByteVec(Number(event.fields.x), Number(event.fields.y))
            ))
          ) {
            setPixels((prevPixels) => {
              const newPixels = [...prevPixels];
              newPixels[indexNewPx] = `#333`;

              return newPixels;
            });
          }
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

    // Cleanup if needed
    return () => {
      // Add code to unsubscribe from events if the library supports it
    };
  }, []);

  useEffect(() => {
    const initializePixels = async () => {
      const contractState = await contractFactory.fetchState();
      const tokenList = await getTokenList();

      setContractState(contractState);
      setTokenMetadata(
        tokenList?.find(
          (token) => token.id === contractState.fields.tokenIdToBurn
        )
      );
      console.log(contractState.fields.tokenIdToBurn);
      // const initialPixels = await getPx();

      // console.log(initialPixels)
      // setPixels(initialPixels);
      setLoading(false); // Stop loading once initialized
    };

    initializePixels();
  }, []);
  const handlePixelClick = useCallback(
    (index: number) => {
      const currentColor = pixels[index];
      setSelectedPixel(index);
      if (currentColor === "#333") {
        setIsResetModal(false);
        setModalVisible(true);
      } else {
        setIsResetModal(true);
        setModalVisible(true);
      }
    },
    [pixels]
  );

  const handleColorClick = useCallback(
    (color: React.SetStateAction<string | null>) => {
      setSelectedColor(color);
    },
    []
  );

  const handleColorSubmit = useCallback(async () => {
    if (selectedPixel !== null && selectedColor) {
      setPixels((prevPixels) => {
        const newPixels = [...prevPixels];
        newPixels[selectedPixel] = selectedColor;
        return newPixels;
      });

      if (signer && contractState !== null) {
        // Get 1-based coordinates
        const [x, y] = getGridCoordinates(selectedPixel);
        // Convert to BigInt and subtract 1 to make 0-based
        const result = await mintPx(
          signer,
          contractState.fields.tokenIdToBurn,
          x,
          y,
          selectedColor,
          contractState.fields.burnMint
        );

        setOngoingTxId(result.txId);
      }
      setModalVisible(false);
      setSelectedColor(null);
      setSelectedPixel(null);
    }
  }, [selectedPixel, selectedColor]);

  const handleResetSubmit = async () => {
    if (!selectedPixel) return;
    const [x, y] = getGridCoordinates(selectedPixel);
    setPixels((prevPixels) => {
      const newPixels = [...prevPixels];
      newPixels[selectedPixel] = "#333";
      return newPixels;
    });
    try {
      if (signer && contractState !== null) {
        const result = await resetPx(signer, x, y);
        console.log(`Reset transaction submitted: ${result.txId}`);
        closeModal();
      }
      // ... rest of your transaction handling
    } catch (error) {
      console.error("Error resetting pixel:", error);
    }
  };

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedColor(null);
    setSelectedPixel(null);
  }, []);

  const memoizedPixels = useMemo(
    () =>
      pixels.map((color, index) => (
        <div
          key={index}
          className={gridStyles.pixel}
          style={{ backgroundColor: color }}
          onClick={() => handlePixelClick(index)}
          title={`${getGridCoordinates(index)[0]}, ${
            getGridCoordinates(index)[1]
          }`}
        />
      )),
    [pixels, handlePixelClick]
  );
  console.log("ongoing..", ongoingTxId);
  return (
    <>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {loading && <p style={{ color: "whitesmoke" }}>Loading the grid</p>}
      {contractState !== null && (
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Minted Pixels</div>
            <div className={styles.statValue}>
              {Number(contractState.fields.numPxMinted)}/{gridSize * gridSize}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Tokens Burned</div>
            <div className={styles.statValue}>
              {tokenMetadata !== undefined ? (
                <>
                  {Number(contractState.fields.balanceBurn) /
                    10 ** tokenMetadata?.decimals}{" "}
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
            </div>
          </div>
        </div>
      )}

      <main>
        <div id={gridStyles.gridContainer}>
          <div id={gridStyles.grid}>{memoizedPixels}</div>
        </div>
      </main>
      {modalVisible && !isResetModal && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
            <span className={gridStyles.close} onClick={closeModal}>
              &times;
            </span>
            <h2>
              Select a color for pixel at{" "}
              {`${selectedPixel && getGridCoordinates(selectedPixel)[0]}, ${
                selectedPixel && getGridCoordinates(selectedPixel)[1]
              }`}
            </h2>
            <p>Contract Fee: 0.1 ALPH</p>
            <p>
              You will burn:{" "}
              {contractState !== null && tokenMetadata !== undefined
                ? `${
                    Number(contractState.fields.burnMint) /
                    10 ** tokenMetadata.decimals
                  } ${tokenMetadata?.symbol}`
                : "0"}
            </p>
            <div id="colorOptions">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`${gridStyles.colorOption} ${
                    selectedColor === color ? gridStyles.selected : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
            <button id="submitColor" onClick={handleColorSubmit}>
              Submit
            </button>
          </div>
        </div>
      )}

      {modalVisible && isResetModal && (
        <div className={gridStyles.modal}>
          <div className={gridStyles.modalContent}>
            <span className={gridStyles.close} onClick={closeModal}>
              &times;
            </span>
            <h2>
              Reset pixel at{" "}
              {`${selectedPixel && getGridCoordinates(selectedPixel)[0]}, ${
                selectedPixel && getGridCoordinates(selectedPixel)[1]
              }`}
            </h2>
            <p>You will reset this pixel to its default state</p>
            <button id="resetColor" onClick={handleResetSubmit}>
              Reset Pixel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
