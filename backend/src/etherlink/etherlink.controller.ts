import { Controller, Post, Get, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { EtherlinkService } from './etherlink.service';

// DTOs for request validation
export class DistributeFundsDto {
  senderAddress: string;
  recipientAddress: string;
  amountInEther: string;
}

export class LockFundsDto {
  amountInEther: string;
}

@Controller('etherlink')
export class EtherlinkController {
  private readonly logger = new Logger(EtherlinkController.name);

  constructor(private readonly etherlinkService: EtherlinkService) {}

  /**
   * Distribute funds to a recipient
   * POST /etherlink/distribute-funds
   */
  @Post('distribute-funds')
  async distributeFunds(@Body() dto: DistributeFundsDto) {
    try {
      this.logger.log(`Distributing funds request: ${JSON.stringify(dto)}`);

      const result = await this.etherlinkService.distributeFunds(
        dto.senderAddress,
        dto.recipientAddress,
        dto.amountInEther
      );
      
      return {
        success: true,
        message: 'Funds distributed successfully',
        data: result
      };
    } catch (error) {
      this.logger.error('Error in distributeFunds endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to distribute funds',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lock funds in the contract
   * POST /etherlink/lock-funds
   */
  @Post('lock-funds')
  async lockFunds(@Body() dto: LockFundsDto) {
    try {
      this.logger.log(`Locking funds request: ${JSON.stringify(dto)}`);
      
      const result = await this.etherlinkService.lockFunds(dto.amountInEther);
      
      return {
        success: true,
        message: 'Funds locked successfully',
        data: result
      };
    } catch (error) {
      this.logger.error('Error in lockFunds endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to lock funds',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get contract balance
   * GET /etherlink/balance
   */
  @Get('balance')
  async getContractBalance() {
    try {
      const balance = await this.etherlinkService.getContractBalanceInEther();
      
      return {
        success: true,
        message: 'Contract balance retrieved successfully',
        data: {
          balance: balance,
          unit: 'ETH'
        }
      };
    } catch (error) {
      this.logger.error('Error in getContractBalance endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get contract balance',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get wallet balance
   * GET /etherlink/wallet-balance
   */
  @Get('wallet-balance')
  async getWalletBalance() {
    try {
      const balance = await this.etherlinkService.getWalletBalance();
      
      return {
        success: true,
        message: 'Wallet balance retrieved successfully',
        data: {
          balance: balance,
          unit: 'ETH'
        }
      };
    } catch (error) {
      this.logger.error('Error in getWalletBalance endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get wallet balance',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get host address
   * GET /etherlink/host
   */
  @Get('host')
  async getHostAddress() {
    try {
      const hostAddress = await this.etherlinkService.getHostAddress();
      
      return {
        success: true,
        message: 'Host address retrieved successfully',
        data: {
          hostAddress: hostAddress
        }
      };
    } catch (error) {
      this.logger.error('Error in getHostAddress endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get host address',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify contract on Sepolia network
   * GET /etherlink/verify-contract
   */
  @Get('verify-contract')
  async verifyContract() {
    try {
      const verification = await this.etherlinkService.verifyContractOnSepolia();
      
      return {
        success: true,
        message: 'Contract verification completed',
        data: verification
      };
    } catch (error) {
      this.logger.error('Error in verifyContract endpoint', error);
      return {
        success: false,
        message: 'Contract verification failed',
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Diagnose connection and contract issues
   * GET /etherlink/diagnose
   */
  @Get('diagnose')
  async diagnoseConnection() {
    try {
      const diagnosis = await this.etherlinkService.diagnoseConnection();
      
      return {
        success: true,
        message: 'Diagnosis completed',
        data: diagnosis
      };
    } catch (error) {
      this.logger.error('Error in diagnose endpoint', error);
      return {
        success: false,
        message: 'Diagnosis failed',
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Check contract deployment status
   * GET /etherlink/status
   */
  @Get('status')
  async getContractStatus() {
    try {
      const status = await this.etherlinkService.getContractStatus();
      
      return {
        success: true,
        message: 'Contract status retrieved successfully',
        data: status
      };
    } catch (error) {
      this.logger.error('Error in getContractStatus endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get contract status',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get contract info
   * GET /etherlink/contract-info
   */
  @Get('contract-info')
  async getContractInfo() {
    try {
      const [balance, hostAddress] = await Promise.all([
        this.etherlinkService.getContractBalanceInEther(),
        this.etherlinkService.getHostAddress()
      ]);
      
      return {
        success: true,
        message: 'Contract info retrieved successfully',
        data: {
          contractAddress: '0xa598c474afc51890B85eaDeb3D49fb2fB62A1851',
          balance: balance,
          balanceUnit: 'ETH',
          hostAddress: hostAddress
        }
      };
    } catch (error) {
      this.logger.error('Error in getContractInfo endpoint', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get contract info',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
