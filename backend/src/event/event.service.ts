import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto, CreatePostDto, CreateCommentDto } from './dto';

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);

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

    async getExplorePosts(userId?: string) {
        return await this.prisma.post.findMany({
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
                    take: 3, // Limit to first 3 comments for explore feed
                },
                _count: {
                    select: {
                        comments: true,
                        userUpvotes: true,
                    },
                },
                userUpvotes: userId ? {
                    where: {
                        userId: userId,
                    },
                    select: {
                        id: true,
                    },
                } : false,
            },
            where: {
                event: {
                    isActive: true, // Only show posts from active events
                },
            },
            orderBy: [
                {
                    createdAt: 'desc',
                },
                {
                    userUpvotes: {
                        _count: 'desc', // Secondary sort by upvote count
                    },
                },
            ],
            take: 20, // Limit to 20 posts for pagination
        }).then(posts => {
            // Transform the data to include user interaction flags
            const transformedPosts = posts.map(post => ({
                ...post,
                isUpvotedByUser: userId ? post.userUpvotes.length > 0 : false,
                userUpvotes: undefined, // Remove the raw userUpvotes data
            }));

            return transformedPosts;
        }).catch(error => {
            console.error('Error fetching explore posts:', error);
            throw new Error('Failed to fetch explore posts');
        });
    }

    async getEventById(eventId: string, userId?: string) {
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
                        userUpvotes: userId ? {
                            where: {
                                userId: userId,
                            },
                            select: {
                                id: true,
                            },
                        } : false,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                userLikes: userId ? {
                    where: {
                        userId: userId,
                    },
                    select: {
                        id: true,
                    },
                } : false,
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

            // Transform the data to include user interaction flags
            const transformedEvent = {
                ...event,
                isLikedByUser: userId ? event.userLikes.length > 0 : false,
                posts: event.posts.map(post => ({
                    ...post,
                    isUpvotedByUser: userId ? post.userUpvotes.length > 0 : false,
                    userUpvotes: undefined, // Remove the raw userUpvotes data
                })),
                userLikes: undefined, // Remove the raw userLikes data
            };

            return transformedEvent;
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

    async createPost(eventId: string, userId: string, createPostDto: CreatePostDto) {
        // First, check if the event exists and if user is a participant or creator
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

        // Check if event is active
        if (!event.isActive) {
            throw new Error('Cannot post to an inactive event');
        }

        // Check if user is either the creator or a participant
        const isCreator = event.creator.id === userId;
        const isParticipant = event.participants.some(participant => participant.id === userId);

        // Only participants can post (creators must also join to post)
        if (!isParticipant) {
            if (isCreator) {
                throw new Error('Event creator must join the event to post');
            } else {
                throw new Error('You must join the event to post');
            }
        }

        // Create the post
        return await this.prisma.post.create({
            data: {
                content: createPostDto.content,
                image: createPostDto.image,
                eventId: eventId,
                authorId: userId,
            },
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
                event: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        userUpvotes: true,
                    },
                },
            },
        }).then(post => {
            return post;
        }).catch(error => {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post');
        });
    }

    async createComment(postId: string, userId: string, createCommentDto: CreateCommentDto) {
        // First, check if the post exists and get post details with event info
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: {
                event: {
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
                },
            },
        });

        if (!post) {
            throw new Error('Post not found');
        }

        // Check if event is active
        if (!post.event.isActive) {
            throw new Error('Cannot comment on posts in an inactive event');
        }

        // Check if user is either the creator or a participant of the event
        const isCreator = post.event.creator.id === userId;
        const isParticipant = post.event.participants.some(participant => participant.id === userId);

        if (!isParticipant && !isCreator) {
            throw new Error('You must be a participant or creator to comment on this post');
        }

        // Create the comment
        return await this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                postId: postId,
                authorId: userId,
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
                post: {
                    select: {
                        id: true,
                        event: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        }).then(comment => {
            return comment;
        }).catch(error => {
            console.error('Error creating comment:', error);
            throw new Error('Failed to create comment');
        });
    }

    async replyToComment(commentId: string, userId: string, createCommentDto: CreateCommentDto) {
        // First, check if the parent comment exists and get event info
        const parentComment = await this.prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                post: {
                    include: {
                        event: {
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
                        },
                    },
                },
            },
        });

        if (!parentComment) {
            throw new Error('Comment not found');
        }

        // Check if event is active
        if (!parentComment.post.event.isActive) {
            throw new Error('Cannot reply to comments in an inactive event');
        }

        // Check if user is either the creator or a participant of the event
        const isCreator = parentComment.post.event.creator.id === userId;
        const isParticipant = parentComment.post.event.participants.some(participant => participant.id === userId);

        if (!isParticipant && !isCreator) {
            throw new Error('You must be a participant or creator to reply to this comment');
        }

        // Create the reply comment
        return await this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                postId: parentComment.postId,
                authorId: userId,
                parentId: commentId,
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
                parent: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                post: {
                    select: {
                        id: true,
                        event: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        }).then(reply => {
            return reply;
        }).catch(error => {
            console.error('Error creating reply:', error);
            throw new Error('Failed to create reply');
        });
    }

    async likeEvent(eventId: string, userId: string) {
        // First, check if the event exists
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if user already liked this event
        const existingLike = await this.prisma.eventLike.findUnique({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
        });

        if (existingLike) {
            throw new Error('You have already liked this event');
        }

        // Create the like
        return await this.prisma.eventLike.create({
            data: {
                userId: userId,
                eventId: eventId,
            },
            select: {
                id: true,
                createdAt: true,
                event: {
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: {
                                userLikes: true,
                            },
                        },
                    },
                },
            },
        }).then(like => {
            return {
                event: {
                    id: like.event.id,
                    title: like.event.title,
                    likesCount: like.event._count.userLikes,
                },
                message: 'Event liked successfully',
            };
        }).catch(error => {
            console.error('Error liking event:', error);
            throw new Error('Failed to like event');
        });
    }

    async unlikeEvent(eventId: string, userId: string) {
        // Check if user has liked this event
        const existingLike = await this.prisma.eventLike.findUnique({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
        });

        if (!existingLike) {
            throw new Error('You have not liked this event');
        }

        // Remove the like
        return await this.prisma.eventLike.delete({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
            select: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: {
                                userLikes: true,
                            },
                        },
                    },
                },
            },
        }).then(deletedLike => {
            return {
                event: {
                    id: deletedLike.event.id,
                    title: deletedLike.event.title,
                    likesCount: deletedLike.event._count.userLikes,
                },
                message: 'Event unliked successfully',
            };
        }).catch(error => {
            console.error('Error unliking event:', error);
            throw new Error('Failed to unlike event');
        });
    }

    async upvotePost(postId: string, userId: string) {
        // First, check if the post exists
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: {
                event: {
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
                },
            },
        });

        if (!post) {
            throw new Error('Post not found');
        }

        // Check if user is either the creator or a participant of the event
        const isCreator = post.event.creator.id === userId;
        const isParticipant = post.event.participants.some(participant => participant.id === userId);

        if (!isParticipant && !isCreator) {
            throw new Error('You must be a participant or creator to upvote posts in this event');
        }

        // Check if user already upvoted this post
        const existingUpvote = await this.prisma.upvote.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId,
                },
            },
        });

        if (existingUpvote) {
            throw new Error('You have already upvoted this post');
        }

        // Create the upvote
        return await this.prisma.upvote.create({
            data: {
                userId: userId,
                postId: postId,
            },
            select: {
                id: true,
                createdAt: true,
                post: {
                    select: {
                        id: true,
                        content: true,
                        _count: {
                            select: {
                                userUpvotes: true,
                            },
                        },
                    },
                },
            },
        }).then(upvote => {
            return {
                post: {
                    id: upvote.post.id,
                    upvotesCount: upvote.post._count.userUpvotes,
                },
                message: 'Post upvoted successfully',
            };
        }).catch(error => {
            console.error('Error upvoting post:', error);
            throw new Error('Failed to upvote post');
        });
    }

    async removeUpvote(postId: string, userId: string) {
        // Check if user has upvoted this post
        const existingUpvote = await this.prisma.upvote.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId,
                },
            },
        });

        if (!existingUpvote) {
            throw new Error('You have not upvoted this post');
        }

        // Remove the upvote
        return await this.prisma.upvote.delete({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId,
                },
            },
            select: {
                post: {
                    select: {
                        id: true,
                        content: true,
                        _count: {
                            select: {
                                userUpvotes: true,
                            },
                        },
                    },
                },
            },
        }).then(deletedUpvote => {
            return {
                post: {
                    id: deletedUpvote.post.id,
                    upvotesCount: deletedUpvote.post._count.userUpvotes,
                },
                message: 'Upvote removed successfully',
            };
        }).catch(error => {
            console.error('Error removing upvote:', error);
            throw new Error('Failed to remove upvote');
        });
    }

    /**
   * Verify an event (Event host or Admin only)
   */
  async verifyEvent(eventId: string, userId: string) {
    try {
      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Check if user is the event creator (host) - only event hosts can verify their own events
      if (event.creator.id !== userId) {
        throw new Error('Only event hosts can verify their events');
      }

      // Update event verification status
      const updatedEvent = await this.prisma.event.update({
        where: { id: eventId },
        data: { 
          verified: true,
          updatedAt: new Date()
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              participants: true,
              posts: true,
              userLikes: true
            }
          }
        }
      });

      this.logger.log(`Event ${eventId} verified by host ${userId}`);
      
      return updatedEvent;
    } catch (error) {
      this.logger.error(`Failed to verify event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Remove verification from an event (Admin only)
   */
  async unverifyEvent(eventId: string, adminId: string) {
    try {
      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Update event verification status
      const updatedEvent = await this.prisma.event.update({
        where: { id: eventId },
        data: { 
          verified: false,
          updatedAt: new Date()
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              participants: true,
              posts: true,
              userLikes: true
            }
          }
        }
      });

      this.logger.log(`Event ${eventId} unverified by admin ${adminId}`);
      
      return updatedEvent;
    } catch (error) {
      this.logger.error(`Failed to unverify event ${eventId}:`, error);
      throw error;
    }
  }
}
