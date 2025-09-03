import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { EventService } from './event.service';

@Controller('api/event')
@UseGuards(JwtGuard, RolesGuard)
export class EventController {
    private readonly logger = new Logger(EventController.name);
    
    constructor(private readonly eventService: EventService) {}

    @Post()
    @Roles(Role.USER, Role.ADMIN)
    async createEvent(
        @GetUser('sub') userId: string,
        @Body() createEventDto: any,
    ) {
        this.logger.log(`User ${userId} creating new event`);
        const data = await this.eventService.createEvent(userId, createEventDto);
        return {
            status: 'success',
            data: data,
        };
    }
}
