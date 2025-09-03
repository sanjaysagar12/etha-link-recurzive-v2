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
                thumbnail: createEventDto.thumbnail,
                startDate: new Date(createEventDto.startDate),
                endDate: new Date(createEventDto.endDate),
                creatorId: userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                prize: true,
                thumbnail: true,
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

    async getAllEvents() {
        return await this.prisma.event.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                prize: true,
                thumbnail: true,
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
                _count: {
                    select: {
                        participants: true,
                        posts: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        }).then(events => {
            return events;
        }).catch(error => {
            console.error('Error fetching events:', error);
            throw new Error('Failed to fetch events');
        });
    }

    async getEventById(eventId: string) {
        return await this.prisma.event.findUnique({
            where: {
                id: eventId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                prize: true,
                thumbnail: true,
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
                        avatar: true,
                    },
                },
                winner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                posts: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                        comments: {
                            where: {
                                parentId: null, // Only top-level comments
                            },
                            select: {
                                id: true,
                                content: true,
                                createdAt: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                                replies: {
                                    select: {
                                        id: true,
                                        content: true,
                                        createdAt: true,
                                        author: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                avatar: true,
                                            },
                                        },
                                        replies: {
                                            select: {
                                                id: true,
                                                content: true,
                                                createdAt: true,
                                                author: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        email: true,
                                                        avatar: true,
                                                    },
                                                },
                                            },
                                            orderBy: {
                                                createdAt: 'asc',
                                            },
                                        },
                                    },
                                    orderBy: {
                                        createdAt: 'asc',
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                        _count: {
                            select: {
                                comments: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        posts: true,
                    },
                },
            },
        }).then(event => {
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        }).catch(error => {
            console.error('Error fetching event:', error);
            if (error.message === 'Event not found') {
                throw new Error('Event not found');
            }
            throw new Error('Failed to fetch event');
        });
    }
}
