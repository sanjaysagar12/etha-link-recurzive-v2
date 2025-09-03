import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async getUserMe(userId) {
        return await this.prisma.user.findUnique({
            where: {
                id: userId, 
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                walletAddress: true,
                
                // Events created by user (hosted events)
                createdEvents: {
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
                        _count: {
                            select: {
                                participants: true,
                                posts: true,
                                userLikes: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                
                // Events joined by user
                joinedEvents: {
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
                        _count: {
                            select: {
                                participants: true,
                                posts: true,
                                userLikes: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                
                // Events won by user
                wonEvents: {
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
                        _count: {
                            select: {
                                participants: true,
                                posts: true,
                                userLikes: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                
                // Posts created by user
                posts: {
                    select: {
                        id: true,
                        content: true,
                        image: true,
                        upvotes: true,
                        createdAt: true,
                        event: {
                            select: {
                                id: true,
                                title: true,
                                thumbnail: true,
                                verified: true,
                                isActive: true,
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
                    take: 10, // Limit to recent 10 posts
                },
                
                // Comments created by user
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        post: {
                            select: {
                                id: true,
                                content: true,
                                event: {
                                    select: {
                                        id: true,
                                        title: true,
                                        isActive: true,
                                    },
                                },
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        parent: {
                            select: {
                                id: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10, // Limit to recent 10 comments
                },
                
                // Upvotes given by user
                upvotes: {
                    select: {
                        id: true,
                        createdAt: true,
                        post: {
                            select: {
                                id: true,
                                content: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                                event: {
                                    select: {
                                        id: true,
                                        title: true,
                                        isActive: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10, // Limit to recent 10 upvotes
                },
                
                // Event likes given by user
                eventLikes: {
                    select: {
                        id: true,
                        createdAt: true,
                        event: {
                            select: {
                                id: true,
                                title: true,
                                thumbnail: true,
                                verified: true,
                                isActive: true,
                                creator: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10, // Limit to recent 10 event likes
                },
                
                // User's wallet information
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                        lockedBalance: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                
                // User's transaction history
                transactions: {
                    select: {
                        id: true,
                        amount: true,
                        type: true,
                        status: true,
                        description: true,
                        txHash: true,
                        createdAt: true,
                        confirmedAt: true,
                        senderWallet: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        receiverWallet: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        event: {
                            select: {
                                id: true,
                                title: true,
                                verified: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 20, // Limit to recent 20 transactions
                },
            },
        }).then(user => {
            if (!user) {
                console.error('User not found with ID:', userId);
                throw new Error('User not found');
            }
            
            // Calculate user statistics
            const stats = {
                totalEventsHosted: user.createdEvents.length,
                totalEventsJoined: user.joinedEvents.length,
                totalEventsWon: user.wonEvents.length,
                totalPosts: user.posts.length,
                totalComments: user.comments.length,
                totalUpvotesGiven: user.upvotes.length,
                totalEventLikes: user.eventLikes.length,
                totalUpvotesReceived: user.posts.reduce((sum, post) => sum + post._count.userUpvotes, 0),
            };
            
            return {
                ...user,
                stats,
            };
        }).catch(error => {
            console.error('Error fetching user:', error);
            throw new Error('Failed to fetch user');
        });
    }
}
