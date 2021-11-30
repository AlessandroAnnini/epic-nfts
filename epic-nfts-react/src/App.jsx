import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { ethers } from 'ethers';
import useWallet from './hooks/useWallet';
import useEpicNftsContract from './hooks/useEpicNftsContract';
import myEpicNft from './utils/MyEpicNFT.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

const TWITTER_LINK_BUILDSPACE = 'https://twitter.com/_buildspace';
const TWITTER_LINK_ALEAN = 'https://twitter.com/ale_annini';
const OPENSEA_LINK =
  'https://testnets.opensea.io/collection/squarenft-llqhtbh8xg';
const contractAddress = '0x5A8Ece51ACEeABfAb2D5f0a648273AC632Ca6AED';
const chainId = '0x4';
const isDebug = true;

const App = () => {
  const { account, connectWallet, walletIsLoading, walletError } = useWallet({
    chainId,
    isDebug,
  });
  const { mintNft, lastNftMinted, contractIsLoading, contractError } =
    useEpicNftsContract({
      contractAddress,
      contractABI: myEpicNft.abi,
      isDebug,
    });

  const renderError = (error) => <p className="error">⚠️ {error.message}</p>;

  const handleCollectionLink = () => window.open(OPENSEA_LINK, '_blank');

  const handleNewNft = () =>
    window.open(
      `https://testnets.opensea.io/assets/${contractAddress}/${lastNftMinted}`,
      '_blank'
    );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Epic NFTs by Alean</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          {!account && !walletIsLoading && (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          )}

          {account &&
            !walletIsLoading &&
            !walletError &&
            !contractIsLoading &&
            !contractError && (
              <button
                onClick={mintNft}
                className="cta-button connect-wallet-button">
                Mint NFT
              </button>
            )}

          {walletError && renderError(walletError)}
          {contractError && renderError(contractError)}

          {lastNftMinted && !contractIsLoading && (
            <div>
              <button
                onClick={handleNewNft}
                className="cta-button view-nft-button">
                💫 CHECK OUT YOUR NEW NFT! ✨
              </button>
            </div>
          )}

          {walletIsLoading || contractIsLoading ? (
            <div className="loader-container">
              <ReactLoading type="cubes" color="#9723f5" />
            </div>
          ) : null}

          <div>
            <button
              onClick={handleCollectionLink}
              className="cta-button view-collection-button">
              🌊 View Collection on OpenSea
            </button>
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK_ALEAN}
            target="_blank"
            rel="noreferrer">{`built by @ale_annini`}</a>
          <a
            className="footer-text"
            href={TWITTER_LINK_BUILDSPACE}
            target="_blank"
            rel="noreferrer">{`with @_buildspace`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
