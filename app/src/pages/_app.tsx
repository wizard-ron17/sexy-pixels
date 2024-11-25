import React from 'react'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import { tokenFaucetConfig } from '../services/utils'
import Background from 'src/components/Background';

export default function App({ Component, pageProps }: AppProps) {

  return (
    <AlephiumWalletProvider theme="simple-dark" network={tokenFaucetConfig.network} addressGroup={tokenFaucetConfig.groupIndex}>
       <Background />
      <Component {...pageProps} />
    </AlephiumWalletProvider>
  )
}
