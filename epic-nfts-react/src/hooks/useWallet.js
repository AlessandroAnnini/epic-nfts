import { useState, useEffect } from 'react';

const ChainIds = {
  '0x1': 'Ethereum Main Network (Mainnet)',
  '0x3': 'Ropsten Test Network',
  '0x4': 'Rinkeby Test Network',
  '0x5': 'Goerli Test Network',
  '0x2a': 'Kovan Test Network',
};

const useWallet = ({ chainId, isDebug }) => {
  // const ethereumRef = useRef(null);
  const [account, setAccount] = useState('');
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

    // ethereumRef.current = ethereum;
    return ethereum;
  };

  const handleNetworkChange = (currentChainId) => {
    if (currentChainId !== chainId) {
      const expectedChainName = ChainIds[chainId];
      consoleLog('You are not connected to the right network');
      setError({
        type: 'chainId',
        message: `You are NOT connected to ${expectedChainName}`,
      });
    } else {
      const currentChainName = ChainIds[currentChainId];
      consoleLog(`You are connected to ${currentChainName}`);
      setError(null);
    }
  };

  const handleAccounstChange = (currentAccounts) => {
    if (!currentAccounts || !currentAccounts.length) {
      consoleLog('Make sure you have an account');
      setAccount('');
      setError({
        type: 'account',
        message: 'Make sure you have an account',
      });
    } else {
      consoleLog(`Your account is ${currentAccounts[0]}`);
      setAccount(currentAccounts[0]);
      setError(null);
    }
  };

  useEffect(() => {
    // check if chainId is valid
    if (!chainId || !Object.keys(ChainIds).includes(chainId))
      throw new Error(`Invalid chainId: ${chainId}`);
  }, []);

  useEffect(() => {
    const checkWallet = async () => {
      const ethereum = getEthereum();
      if (!ethereum) return;

      setIsLoading(true);
      consoleLog('We have the ethereum object', ethereum);

      try {
        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length) {
          const account = accounts[0];
          consoleLog('Found an authorized account:', account);
          setAccount(account);
          setError(null);
        } else {
          consoleLog('No authorized account found');
          setError({ type: 'account', message: 'No authorized account found' });
        }
      } catch (error) {
        consoleLog(error);
        setError({ type: 'check-wallet', message: error.message });
      }

      setIsLoading(false);
    };

    checkWallet();
  }, []);

  useEffect(() => {
    if (!account) return;

    const checkNetwork = async () => {
      const ethereum = getEthereum();
      if (!ethereum) return;

      setIsLoading(true);

      try {
        const currentChainId = await ethereum.request({
          method: 'eth_chainId',
        });

        handleNetworkChange(currentChainId);
      } catch (error) {
        consoleLog(error);
        setError({ type: 'check-network', message: error.message });
      }

      setIsLoading(false);
    };

    checkNetwork();
  }, [account]);

  useEffect(() => {
    if (!account) return;

    const checkNetworkChange = () => {
      const ethereum = getEthereum();
      if (!ethereum) return;

      try {
        ethereum.on('chainChanged', handleNetworkChange);
      } catch (error) {
        consoleLog(error);
        setError({ type: 'check-network', message: error.message });
      }
    };

    checkNetworkChange();

    return () => {
      ethereum.removeListener('chainChanged', handleNetworkChange);
    };
  }, [account]);

  useEffect(() => {
    if (!account) return;

    const checkAccountChange = () => {
      const ethereum = getEthereum();
      if (!ethereum) return;

      try {
        ethereum.on('accountsChanged', handleAccounstChange);
      } catch (error) {
        consoleLog(error);
        setError({ type: 'check-network', message: error.message });
      }
    };

    checkAccountChange();

    return () => {
      ethereum.removeListener('accountsChanged', handleAccounstChange);
    };
  }, [account]);

  const connect = async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    setIsLoading(true);

    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      consoleLog('Connected', accounts[0]);
      setAccount(accounts[0]);
    } catch (error) {
      consoleLog(error);
      setError({ type: 'connect', message: error.message });
    }
    setIsLoading(false);
  };

  return {
    account,
    connectWallet: connect,
    walletIsLoading: isLoading,
    walletError: error,
  };
};

export default useWallet;
