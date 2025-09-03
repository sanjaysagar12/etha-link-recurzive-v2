import { Controller, Post, Body, UseGuards, Logger, Get, Param } from '@nestjs/common';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { EventService } from './event.service';
import { CreateEventDto } from './dto';

@Controller('api/event')
export class EventController {
    private readonly logger = new Logger(EventController.name);
    
    constructor(private readonly eventService: EventService) {}

    @Post()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async createEvent(
        @GetUser('sub') userId: string,
        @Body() createEventDto: CreateEventDto,
    ) {
        this.logger.log(`User ${userId} creating new event`);
        const data = await this.eventService.createEvent(userId, createEventDto);
        return {
            status: 'success',
            data: data,
        };
    }

    @Get()
    async getAllEvents() {
        this.logger.log('Fetching all events');
        const data = await this.eventService.getAllEvents();
        return {
            status: 'success',
            data: data,
        };
    }

    @Get(':id')
    async getEventById(@Param('id') eventId: string) {
        this.logger.log(`Fetching event details for ID: ${eventId}`);
        const data = await this.eventService.getEventById(eventId);
        return {
            status: 'success',
            data: data,
        };
    }
}
