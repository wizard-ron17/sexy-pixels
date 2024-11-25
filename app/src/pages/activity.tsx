import React from 'react'
import Head from 'next/head'
import { AlephiumConnectButton } from '@alephium/web3-react'
import gridStyles from "../styles/App.module.css"
import { ActivityEvents } from '../components/Activity'
import styles from '../styles/Activity.module.css';
import Link from 'next/link'


export default function Activity() {
  return (
    <>
      <Head>
        <title>$EXY PIXELS - Activity</title>
        <meta name="description" content="Activity feed for $EXY PIXELS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={gridStyles.App}>
        <header>
          <h1>$EXY PIXELS</h1>
          <nav>
          <Link href="/" className="nav-text">Home</Link>
          <Link href="/docs" className="nav-text">Docs</Link>
            <AlephiumConnectButton />
          </nav>
        </header>
        <main>

      <div className={styles.titleContainer}>
        <h2 className={styles.leaderboardTitle}>Activity Feed</h2>
        <div className={styles.liveIndicator}>
          <div className={styles.pulse}></div>
          <span>LIVE</span>
        </div>
      </div>
          <ActivityEvents/>
        </main>
      </div>
    </>
  )
} 