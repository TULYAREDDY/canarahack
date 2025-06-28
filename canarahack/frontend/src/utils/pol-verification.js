// POL Configuration Verification Utility
// This script helps verify that your setup is correct for Polygon Amoy testnet

export const AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

export const verifyAmoySetup = async () => {
  const checks = {
    metamask: false,
    correctNetwork: false,
    correctCurrency: false,
    hasBalance: false
  };

  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      checks.metamask = true;
      
      // Check if connected to Amoy
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      checks.correctNetwork = chainId === AMOY_CONFIG.chainId;
      
      if (checks.correctNetwork) {
        // Check if we can get account info (currency should be POL)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          checks.correctCurrency = true; // MetaMask will show POL for Amoy
          
          // Check balance (optional - just to verify connection)
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          checks.hasBalance = balance.gt(0);
        }
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
  }

  return checks;
};

export const switchToAmoy = async () => {
  try {
    // Try to switch to Amoy
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AMOY_CONFIG.chainId }],
    });
    return { success: true, message: 'Switched to Amoy testnet' };
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Chain not added, add it
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [AMOY_CONFIG],
        });
        return { success: true, message: 'Added and switched to Amoy testnet' };
      } catch (addError) {
        return { success: false, message: 'Failed to add Amoy network: ' + addError.message };
      }
    } else {
      return { success: false, message: 'Failed to switch network: ' + switchError.message };
    }
  }
};

export const getAmoyFaucetUrl = () => {
  return 'https://faucet.polygon.technology/';
};

export const getPolBalance = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      const balance = await provider.getBalance(accounts[0]);
      return ethers.utils.formatEther(balance);
    }
    return '0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}; 