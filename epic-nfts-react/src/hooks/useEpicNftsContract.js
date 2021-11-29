import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

const useEpicNftsContract = ({
  contractAddress,
  contractABI,
  onNftMinted,
  isDebug,
}) => {
  const contractRef = useRef(null);
  const [lastNftMinted, setLastNftMinted] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const consoleLog = (...args) => isDebug && console.log(...args);

  // Make sure we have access to window.ethereum
  const getEthereum = () => {
    const { ethereum } = window;
    if (!ethereum) {
      consoleLog('Make sure you have a connected wallet');
      setError({
        type: 'ethereum',
        message: 'Make sure you have a connected wallet',
      });
      return false;
    }

    return ethereum;
  };

  const handleNewTokenMinted = (from, tokenId) => {
    const tokenIdNumber = tokenId.toNumber();
    consoleLog(from, tokenIdNumber);
    setLastNftMinted(tokenIdNumber);
    onNftMinted && onNftMinted(tokenIdNumber);
  };

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    setIsLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      contractRef.current = connectedContract;
    } catch (error) {
      consoleLog(error);
      setError({ type: 'contract', message: error.message });
    }

    setIsLoading(false);
  }, [contractAddress, contractABI]);

  useEffect(() => {
    if (!contractRef.current) return;
    setIsLoading(true);

    try {
      // This will essentially "capture" our event when our contract throws it.
      contractRef.current.on('NewEpicNFTMinted', handleNewTokenMinted);
    } catch (error) {
      consoleLog(error);
      setError({ type: 'minting', message: error.message });
    }

    setIsLoading(false);

    return () => {
      contractRef.current.removeListener(
        'NewEpicNFTMinted',
        handleNewTokenMinted
      );
    };
  }, [contractRef.current]);

  const mintNft = async () => {
    setIsLoading(true);
    setLastNftMinted('');

    try {
      const totalMinted = await contractRef.current.getTotalNFTsMintedSoFar();
      consoleLog('total minted', totalMinted.toNumber());

      if (totalMinted >= 50) {
        consoleLog('We are out of NFTs');
        setIsLoading(false);
        setError({ type: 'minting', message: 'We are out of NFTs' });
        return;
      }

      consoleLog('Going to pop wallet now to pay gas...');
      const nftTxn = await contractRef.current.makeAnEpicNFT();

      consoleLog('mining...');

      await nftTxn.wait();

      consoleLog(
        `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
      );
    } catch (error) {
      consoleLog(error);
      setError({ type: 'minting', message: error.message });
    }
    setIsLoading(false);
  };

  return {
    mintNft,
    lastNftMinted,
    contractIsLoading: isLoading,
    contractError: error,
  };
};

export default useEpicNftsContract;
