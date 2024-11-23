import React from 'react'
import Head from 'next/head'
import { AlephiumConnectButton } from '@alephium/web3-react'
import gridStyles from "../styles/App.module.css"
import { ActivityEvents } from '@/components/Activity'

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
            <span className="nav-text" onClick={() => window.location.href = '/'}>Home</span>
            <span className="nav-text" onClick={() => window.location.href = '/docs'}>Docs</span>
            <AlephiumConnectButton />
          </nav>
        </header>
        <main>
          <h2>Activity Feed</h2>
          <ActivityEvents/>
        </main>
      </div>
    </>
  )
} 