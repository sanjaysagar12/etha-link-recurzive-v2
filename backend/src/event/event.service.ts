import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}
    
    async createEvent(userId: string, createEventDto: CreateEventDto) {
        return await this.prisma.event.create({
            data: {
                title: createEventDto.title,
                description: createEventDto.description,
                prize: createEventDto.prize,
                startDate: new Date(createEventDto.startDate),
                endDate: new Date(createEventDto.endDate),
                creatorId: userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                prize: true,
                verified: true,
                startDate: true,
                endDate: true,
                isActive: true,
                createdAt: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        }).then(event => {
            return event;
        }).catch(error => {
            console.error('Error creating event:', error);
            throw new Error('Failed to create event');
        });
    }
}
