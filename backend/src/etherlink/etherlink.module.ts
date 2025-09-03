import { Module } from '@nestjs/common';
import { EtherlinkController } from './etherlink.controller';
import { EtherlinkService } from './etherlink.service';

@Module({
  controllers: [EtherlinkController],
  providers: [EtherlinkService]
})
export class EtherlinkModule {}
