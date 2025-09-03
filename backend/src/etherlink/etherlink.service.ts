import { Injectable, Logger } from '@nestjs/common';
import { ETHERLINK_CONFIG, CONTRACT_ABI } from './etherlink.config';
const { ethers } = require('ethers');

@Injectable()
export class EtherlinkService {
  private readonly logger = new Logger(EtherlinkService.name);
  private readonly provider: any;
  private readonly wallet: any;
  private readonly contract: any;

  // Contract configuration 0x7d3d66d695fE6753E69Fd65c47b000f65f613ab2
  private readonly CONTRACT_ADDRESS = '0xa598c474afc51890B85eaDeb3D49fb2fB62A1851';
  private readonly PRIVATE_KEY = 'e2f9bf23000effa9a76e62c0bf4ce3ab8cc63bd8d65e608c1fa5bef11ae46b0a';
  
  // Contract ABI
  private readonly CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsDistributed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsLocked",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "distributeFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "host",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lockFunds",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];


  constructor() {
    try {
      // Use Sepolia RPC URLs (skip Infura/Alchemy that need API keys)
      const sepoliaRPCs = [
        'https://sepolia.drpc.org',
        'https://rpc.sepolia.org',
        'https://eth-sepolia-public.unifra.io',
        'https://sepolia.gateway.tenderly.co'
      ];
      
      // Use the first public RPC URL
      this.provider = new ethers.JsonRpcProvider(sepoliaRPCs[0]);
      
      // Create wallet instance
      this.wallet = new ethers.Wallet(this.PRIVATE_KEY, this.provider);
      
      // Create contract instance
      this.contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        this.CONTRACT_ABI,
        this.wallet
      );

      this.logger.log('EtherLink service initialized for Sepolia testnet');
      this.logger.log(`Contract address: ${this.CONTRACT_ADDRESS}`);
      this.logger.log(`Wallet address: ${this.wallet.address}`);
      
      // Test connection
      this.testConnection();
    } catch (error) {
      this.logger.error('Failed to initialize EtherLink service', error);
      throw error;
    }
  }

  /**
   * Test the connection and contract deployment
   */
  async testConnection(): Promise<void> {
    try {
      // Test provider connection
      const network = await this.provider.getNetwork();
      this.logger.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Test if contract is deployed
      const code = await this.provider.getCode(this.CONTRACT_ADDRESS);
      if (code === '0x') {
        this.logger.warn('Contract not deployed at the specified address or wrong network');
      } else {
        this.logger.log('Contract found and deployed');
      }
    } catch (error) {
      this.logger.error('Connection test failed', error);
    }
  }

  /**
   * Distribute funds to a recipient
   * @param recipientAddress - The address to receive the funds
   * @param amountInEther - The amount in Ether (will be converted to Wei)
   * @returns Transaction receipt
   */
  async distributeFunds(recipientAddress: string, amountInEther: string): Promise<any> {
    try {
      this.logger.log(`Distributing ${amountInEther} ETH to ${recipientAddress}`);

      // Validate recipient address
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Convert amount to Wei
      const amountInWei = ethers.parseEther(amountInEther);

      // Check contract balance before transaction
      const contractBalance = await this.getContractBalance();
      if (contractBalance < amountInWei) {
        throw new Error(`Insufficient contract balance. Available: ${ethers.formatEther(contractBalance)} ETH`);
      }

      // Call distributeFunds function
      const transaction = await this.contract.distributeFunds(recipientAddress, amountInWei);
      
      this.logger.log(`Transaction sent: ${transaction.hash}`);

      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        recipient: recipientAddress,
        amount: amountInEther,
        amountInWei: amountInWei.toString()
      };

    } catch (error) {
      this.logger.error('Error distributing funds', error);
      throw error;
    }
  }

  /**
   * Get contract balance in Wei
   * @returns Contract balance in Wei
   */
  async getContractBalance(): Promise<bigint> {
    try {
      // First check if contract exists
      const code = await this.provider.getCode(this.CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error(`Contract not found at address ${this.CONTRACT_ADDRESS}. Please verify the contract is deployed.`);
      }

      const balance = await this.contract.getBalance();
      return balance;
    } catch (error) {
      this.logger.error('Error getting contract balance', error);
      
      // If contract call fails, try getting balance directly from provider
      try {
        const directBalance = await this.provider.getBalance(this.CONTRACT_ADDRESS);
        this.logger.warn('Contract call failed, returning direct balance from provider');
        return directBalance;
      } catch (providerError) {
        this.logger.error('Provider balance call also failed', providerError);
        throw new Error(`Failed to get contract balance: ${error.message}`);
      }
    }
  }

  /**
   * Get contract balance in Ether
   * @returns Contract balance in Ether as string
   */
  async getContractBalanceInEther(): Promise<string> {
    try {
      const balanceInWei = await this.getContractBalance();
      return ethers.formatEther(balanceInWei);
    } catch (error) {
      this.logger.error('Error getting contract balance in Ether', error);
      throw error;
    }
  }

  /**
   * Get the host address of the contract
   * @returns Host address
   */
  async getHostAddress(): Promise<string> {
    try {
      // First check if contract exists
      const code = await this.provider.getCode(this.CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error(`Contract not found at address ${this.CONTRACT_ADDRESS}. Please verify the contract is deployed.`);
      }

      const host = await this.contract.host();
      return host;
    } catch (error) {
      this.logger.error('Error getting host address', error);
      throw new Error(`Failed to get host address: ${error.message}`);
    }
  }

  /**
   * Lock funds in the contract (payable function)
   * @param amountInEther - Amount in Ether to lock
   * @returns Transaction receipt
   */
  async lockFunds(amountInEther: string): Promise<any> {
    try {
      this.logger.log(`Locking ${amountInEther} ETH in contract`);

      const amountInWei = ethers.parseEther(amountInEther);

      // Call lockFunds function with value
      const transaction = await this.contract.lockFunds({
        value: amountInWei
      });

      this.logger.log(`Lock funds transaction sent: ${transaction.hash}`);

      const receipt = await transaction.wait();
      
      this.logger.log(`Lock funds transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        amount: amountInEther,
        amountInWei: amountInWei.toString()
      };

    } catch (error) {
      this.logger.error('Error locking funds', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @returns Wallet balance in Ether
   */
  async getWalletBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error('Error getting wallet balance', error);
      throw error;
    }
  }

  /**
   * Get contract deployment status and network info
   * @returns Contract status information
   */
  async getContractStatus(): Promise<any> {
    try {
      // Get network information
      const network = await this.provider.getNetwork();
      
      // Check if contract is deployed
      const code = await this.provider.getCode(this.CONTRACT_ADDRESS);
      const isDeployed = code !== '0x';
      
      // Get wallet balance
      const walletBalance = await this.provider.getBalance(this.wallet.address);
      
      // Get contract balance (direct from provider)
      const contractBalance = await this.provider.getBalance(this.CONTRACT_ADDRESS);
      
      let hostAddress = null;
      if (isDeployed) {
        try {
          hostAddress = await this.contract.host();
        } catch (error) {
          this.logger.warn('Failed to get host address from contract', error);
        }
      }

      return {
        network: {
          name: network.name,
          chainId: network.chainId.toString()
        },
        contract: {
          address: this.CONTRACT_ADDRESS,
          isDeployed: isDeployed,
          balance: ethers.formatEther(contractBalance),
          balanceUnit: 'ETH',
          hostAddress: hostAddress
        },
        wallet: {
          address: this.wallet.address,
          balance: ethers.formatEther(walletBalance),
          balanceUnit: 'ETH'
        }
      };
    } catch (error) {
      this.logger.error('Error getting contract status', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for the contract
   */
  setupEventListeners(): void {
    try {
      // Listen to FundsLocked events
      this.contract.on('FundsLocked', (sender, amount, event) => {
        this.logger.log(`FundsLocked event: ${sender} locked ${ethers.formatEther(amount)} ETH`);
        // You can add custom logic here, like updating database
      });

      // Listen to FundsDistributed events
      this.contract.on('FundsDistributed', (recipient, amount, event) => {
        this.logger.log(`FundsDistributed event: ${recipient} received ${ethers.formatEther(amount)} ETH`);
        // You can add custom logic here, like updating database
      });

      this.logger.log('Event listeners setup successfully');
    } catch (error) {
      this.logger.error('Error setting up event listeners', error);
    }
  }

  /**
   * Diagnose connection and contract deployment issues
   * @returns Diagnostic information
   */
  async diagnoseConnection(): Promise<any> {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      checks: [] as any[]
    };

    // Check 1: Provider connection
    try {
      const network = await this.provider.getNetwork();
      diagnosis.checks.push({
        test: 'Provider Connection',
        status: 'PASS',
        data: {
          network: network.name,
          chainId: network.chainId.toString()
        }
      });
    } catch (error) {
      diagnosis.checks.push({
        test: 'Provider Connection',
        status: 'FAIL',
        error: error.message
      });
    }

    // Check 2: Wallet configuration
    try {
      const walletAddress = this.wallet.address;
      const walletBalance = await this.provider.getBalance(walletAddress);
      diagnosis.checks.push({
        test: 'Wallet Configuration',
        status: 'PASS',
        data: {
          address: walletAddress,
          balance: ethers.formatEther(walletBalance),
          balanceUnit: 'ETH'
        }
      });
    } catch (error) {
      diagnosis.checks.push({
        test: 'Wallet Configuration',
        status: 'FAIL',
        error: error.message
      });
    }

    // Check 3: Contract deployment
    try {
      const contractCode = await this.provider.getCode(this.CONTRACT_ADDRESS);
      const isDeployed = contractCode !== '0x';
      diagnosis.checks.push({
        test: 'Contract Deployment',
        status: isDeployed ? 'PASS' : 'FAIL',
        data: {
          address: this.CONTRACT_ADDRESS,
          isDeployed: isDeployed,
          codeLength: contractCode.length
        }
      });
    } catch (error) {
      diagnosis.checks.push({
        test: 'Contract Deployment',
        status: 'FAIL',
        error: error.message
      });
    }

    // Check 4: Contract balance (direct provider call)
    try {
      const contractBalance = await this.provider.getBalance(this.CONTRACT_ADDRESS);
      diagnosis.checks.push({
        test: 'Contract Balance (Direct)',
        status: 'PASS',
        data: {
          balance: ethers.formatEther(contractBalance),
          balanceUnit: 'ETH'
        }
      });
    } catch (error) {
      diagnosis.checks.push({
        test: 'Contract Balance (Direct)',
        status: 'FAIL',
        error: error.message
      });
    }

    // Check 5: Contract function calls (if deployed)
    const contractDeployedCheck = diagnosis.checks.find(c => c.test === 'Contract Deployment');
    if (contractDeployedCheck && contractDeployedCheck.status === 'PASS') {
      try {
        const hostAddress = await this.contract.host();
        diagnosis.checks.push({
          test: 'Contract Function Call (host)',
          status: 'PASS',
          data: {
            hostAddress: hostAddress
          }
        });
      } catch (error) {
        diagnosis.checks.push({
          test: 'Contract Function Call (host)',
          status: 'FAIL',
          error: error.message
        });
      }

      try {
        const contractBalance = await this.contract.getBalance();
        diagnosis.checks.push({
          test: 'Contract Function Call (getBalance)',
          status: 'PASS',
          data: {
            balance: ethers.formatEther(contractBalance),
            balanceUnit: 'ETH'
          }
        });
      } catch (error) {
        diagnosis.checks.push({
          test: 'Contract Function Call (getBalance)',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    return diagnosis;
  }

  /**
   * Verify contract deployment on Sepolia
   */
  async verifyContractOnSepolia(): Promise<any> {
    const verification = {
      timestamp: new Date().toISOString(),
      contractAddress: this.CONTRACT_ADDRESS,
      checks: [] as any[]
    };

    // Test different Sepolia RPC endpoints
    const sepoliaRPCs = [
      'https://sepolia.drpc.org',
      'https://rpc.sepolia.org',
      'https://eth-sepolia-public.unifra.io',
      'https://sepolia.gateway.tenderly.co'
    ];

    for (const rpcUrl of sepoliaRPCs) {
      try {
        const testProvider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test network connection
        const network = await testProvider.getNetwork();
        
        // Check contract deployment
        const code = await testProvider.getCode(this.CONTRACT_ADDRESS);
        const isDeployed = code !== '0x';
        
        let contractBalance = '0';
        let hostAddress = null;
        
        if (isDeployed) {
          try {
            const balance = await testProvider.getBalance(this.CONTRACT_ADDRESS);
            contractBalance = ethers.formatEther(balance);
            
            // Try to call contract function
            const testContract = new ethers.Contract(this.CONTRACT_ADDRESS, this.CONTRACT_ABI, testProvider);
            hostAddress = await testContract.host();
          } catch (contractError) {
            // Contract exists but functions might fail
          }
        }

        verification.checks.push({
          rpcUrl: rpcUrl,
          status: 'SUCCESS',
          network: {
            name: network.name,
            chainId: network.chainId.toString()
          },
          contract: {
            isDeployed: isDeployed,
            codeLength: code.length,
            balance: contractBalance,
            hostAddress: hostAddress
          }
        });

        // If we found a working RPC, break
        if (isDeployed) {
          break;
        }

      } catch (error) {
        verification.checks.push({
          rpcUrl: rpcUrl,
          status: 'FAILED',
          error: error.message
        });
      }
    }

    return verification;
  }
}
