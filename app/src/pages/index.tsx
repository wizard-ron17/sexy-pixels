import React, { useState } from 'react'
import Head from 'next/head'
import { TokenDapp } from '@/components/TokenDapp'
import { tokenFaucetConfig } from '@/services/utils'
import LaunchOverlay from '@/components/LaunchOverlay'

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(false)

  const handleCloseOverlay = () => {
    setShowOverlay(false)
  }

  return (
    <>
        <Head>
        <title>$EXY PIXELS</title>
        <meta name="description" content="Burn to play" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        
          <TokenDapp config={tokenFaucetConfig} />
        
        {showOverlay && <LaunchOverlay onClose={handleCloseOverlay} />}
      </div>
    </>
  )
}
