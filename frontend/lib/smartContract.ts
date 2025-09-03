// Smart Contract Configuration
export const SMART_CONTRACT_CONFIG = {
  // Contract address on Sepolia testnet
  CONTRACT_ADDRESS: '0xa598c474afc51890B85eaDeb3D49fb2fB62A1851',
  
  // Network configuration
  NETWORK: {
    chainId: '0xaa36a7', // 11155111 in hex (Sepolia)
    chainName: 'Sepolia test network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },

  // Contract ABI
  CONTRACT_ABI: [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsDistributed","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsLocked","type":"event"},
    {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"distributeFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"host","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"lockFunds","outputs":[],"stateMutability":"payable","type":"function"},
    {"stateMutability":"payable","type":"receive"}
  ]
};

// Smart contract utility functions
export class SmartContractService {
  static async checkMetaMask(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  static async requestAccounts(): Promise<string[]> {
    if (!await this.checkMetaMask()) {
      throw new Error('MetaMask not found. Please install MetaMask to continue.');
    }
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  static async switchToSepolia(): Promise<void> {
    if (!await this.checkMetaMask()) {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SMART_CONTRACT_CONFIG.NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SMART_CONTRACT_CONFIG.NETWORK],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Sepolia network');
      }
    }
  }
}