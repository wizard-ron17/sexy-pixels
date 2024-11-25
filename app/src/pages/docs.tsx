import React from 'react'
import Head from 'next/head'
import { AlephiumConnectButton } from '@alephium/web3-react'
import gridStyles from "../styles/App.module.css"
import styles from "../styles/Docs.module.css"
import Link from 'next/link'

export default function Docs() {
  return (
    <>
      <Head>
        <title>$EXY PIXELS - Docs</title>
        <meta name="description" content="Documentation for $EXY PIXELS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={gridStyles.App}>
        <header>
          <h1>$EXY PIXELS</h1>
          <nav>
            <Link href="/" className="nav-text">Home</Link>
            <Link href="/activity" className="nav-text">Activity</Link>
            <AlephiumConnectButton />
          </nav>
        </header>
        <main>
          
          <section className={styles.docsSection}>
            <h3 className={styles.sectionHeading}>Inspiration</h3>
            <div className={styles.docsContent}>
              <p>
                The $EXY PIXELS project draws inspiration from the iconic <a href="https://en.wikipedia.org/wiki/R/place" target="_blank" rel="noopener noreferrer">r/place experiment</a>, 
                where communities collaborated pixel by pixel to create art. 
                We wanted to recreate this concept using the security and scalability of Ralph
                and the Alephium Blockchain.
              </p>
            </div>
          </section>

          <section className={styles.docsSection}>
            <h3 className={styles.sectionHeading}>Minting</h3>
            <div className={styles.docsContent}>
              <p>
                $EXY PIXELS operates through a smart contract on the Alephium blockchain. 
                Users can interact with the canvas by simply clicking an uncolored pixel, 
                choosing a color, then signing a prompt in their Alephium Wallet. 
                Each mint costs a 0.1 $ALPH contract creation fee, and will also burn 
                690 $EXY Tokens from the minter's wallet.
                Don't own any $EXY? Buy some <a href="https://www.elexium.finance/swap?tokenA=28LgMeQGdvtXfsvWhpNNVx1DoSiz7TzrATv9qxMQP5is9&tokenB=26ZZNScke9xJyVcZAktVGvwRwRd8ArVtpXK2hqpEK6UsR&stable=false" target="_blank" rel="noopener noreferrer">here</a>.
              </p>
            </div>
          </section>

          <section className={styles.docsSection}>
            <h3 className={styles.sectionHeading}>Resetting & Recoloring</h3>
            <div className={styles.docsContent}>
              <p>
                Pixels can also be reset to their default uncolored state, or recolored to a new color. To do so,
                just click a pixel that's already been colored, and choose to either reset or recolor.
                Resetting or recoloring a pixel will return the 0.1 $ALPH contract creation fee to the original minter. 
                Once a pixel is reset, it can then be colored again using the same mint process as before.
              </p>
            </div>
          </section>

          <section className={styles.docsSection}>
            <h3 className={styles.sectionHeading}>What's Next?</h3>
            <div className={styles.docsContent}>
              <p>
                We plan on expanding the grid to be larger than 20x20. Additionally, we want to add various mechanics
                and features to gamify the project. Giving the user the ability to create their own custom grids that 
                burn whatever token they want is also on the agenda for V2.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  )
} 