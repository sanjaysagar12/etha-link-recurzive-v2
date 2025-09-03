/**
 * Ethereum Sepolia Network Configuration
 */
export const ETHERLINK_CONFIG = {
  // Contract Configuration
  CONTRACT_ADDRESS: '0xa598c474afc51890B85eaDeb3D49fb2fB62A1851',
  PRIVATE_KEY: 'e2f9bf23000effa9a76e62c0bf4ce3ab8cc63bd8d65e608c1fa5bef11ae46b0a',

  // RPC Endpoints for Sepolia (try in order)
  RPC_URLS: [
    'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
    'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY', // Replace with your Alchemy key
    'https://sepolia.drpc.org',
    'https://rpc.sepolia.org',
    'https://eth-sepolia-public.unifra.io',
    'https://sepolia.gateway.tenderly.co',
  ],

  // Network Information
  NETWORK: {
    NAME: 'Sepolia Testnet',
    CHAIN_ID: 11155111, // Sepolia testnet chain ID
  },

  // Gas Configuration
  GAS: {
    LIMIT: 300000,
    PRICE: '20000000000', // 20 gwei
  },

  // Transaction Settings
  TRANSACTION: {
    CONFIRMATIONS: 1,
    TIMEOUT: 60000, // 60 seconds
  }
};

/**
 * Alternative Sepolia RPC URLs
 */
export const ALTERNATIVE_RPCS = [
  'https://sepolia.drpc.org',
  'https://rpc.sepolia.org',
  'https://eth-sepolia-public.unifra.io',
  'https://sepolia.gateway.tenderly.co',
];

/**
 * Contract ABI
 */
export const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsLocked","type":"event"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"distributeFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"host","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lockFunds","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}]