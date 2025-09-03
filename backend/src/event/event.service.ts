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
                likes: true,
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
                        content: true,
                        image: true,
                        upvotes: true,
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
                                userUpvotes: true,
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
                        userLikes: true,
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

    async joinEvent(eventId: string, userId: string) {
        // First, check if the event exists and get event details
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                creator: {
                    select: {
                        id: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if user is the event creator (host)
        if (event.creator.id === userId) {
            throw new Error('Event host cannot join their own event');
        }

        // Check if user is already a participant
        const isAlreadyParticipant = event.participants.some(participant => participant.id === userId);
        if (isAlreadyParticipant) {
            throw new Error('You are already a participant in this event');
        }

        // Check if event is active
        if (!event.isActive) {
            throw new Error('Cannot join an inactive event');
        }

        // Check if event has not ended
        if (new Date() > event.endDate) {
            throw new Error('Cannot join an event that has already ended');
        }

        // Add user to participants
        return await this.prisma.event.update({
            where: { id: eventId },
            data: {
                participants: {
                    connect: { id: userId },
                },
            },
            select: {
                id: true,
                title: true,
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                    },
                },
            },
        }).then(updatedEvent => {
            return {
                event: {
                    id: updatedEvent.id,
                    title: updatedEvent.title,
                    participantCount: updatedEvent._count.participants,
                },
                message: 'Successfully joined the event',
            };
        }).catch(error => {
            console.error('Error joining event:', error);
            throw new Error('Failed to join event');
        });
    }
}
