import { Controller, Post, Body, UseGuards, Logger, Get, Param, Patch, UseInterceptors, Request } from '@nestjs/common';
import { Roles, Role } from 'src/application/common/decorator/roles.decorator';
import { JwtGuard } from '../application/common/guards/jwt.guard';
import { RolesGuard } from '../application/common/guards/roles.guard';
import { GetUser } from 'src/application/common/decorator/get-user.decorator';
import { GetOptionalUser } from 'src/application/common/decorator/get-optional-user.decorator';
import { EventService } from './event.service';
import { CreateEventDto, CreatePostDto, CreateCommentDto } from './dto';

// Create an optional JWT guard that doesn't throw errors
class OptionalJwtGuard extends JwtGuard {
  handleRequest(err, user, info) {
    // Return user if valid, otherwise return null (don't throw error)
    return user || null;
  }
}

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

    @Get('explore')
    @UseGuards(OptionalJwtGuard)
    async explorePosts(
        @GetOptionalUser('sub') userId?: string,
    ) {
        this.logger.log(`Fetching explore posts ${userId ? `for user ${userId}` : 'for anonymous user'}`);
        const data = await this.eventService.getExplorePosts(userId);
        return {
            status: 'success',
            data: data,
        };
    }

    @Get(':id')
    @UseGuards(OptionalJwtGuard)
    async getEventById(
        @Param('id') eventId: string,
        @GetOptionalUser('sub') userId?: string,
    ) {
        this.logger.log(`Fetching event details for ID: ${eventId} ${userId ? `for user ${userId}` : 'for anonymous user'}`);
        const data = await this.eventService.getEventById(eventId, userId);
        return {
            status: 'success',
            data: data,
        };
    }

    @Patch(':id/join')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async joinEvent(
        @Param('id') eventId: string,
        @GetUser('sub') userId: string,
    ) {
        this.logger.log(`User ${userId} attempting to join event ${eventId}`);
        const data = await this.eventService.joinEvent(eventId, userId);
        return {
            status: 'success',
            data: data,
            message: 'Successfully joined the event',
        };
    }

    @Post(':id/post')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async createPost(
        @Param('id') eventId: string,
        @GetUser('sub') userId: string,
        @Body() createPostDto: CreatePostDto,
    ) {
        this.logger.log(`User ${userId} creating post for event ${eventId}`);
        const data = await this.eventService.createPost(eventId, userId, createPostDto);
        return {
            status: 'success',
            data: data,
            message: 'Post created successfully',
        };
    }

    @Post('post/:postId/comment')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async createComment(
        @Param('postId') postId: string,
        @GetUser('sub') userId: string,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        this.logger.log(`User ${userId} creating comment for post ${postId}`);
        const data = await this.eventService.createComment(postId, userId, createCommentDto);
        return {
            status: 'success',
            data: data,
            message: 'Comment created successfully',
        };
    }

    @Post('comment/:commentId/reply')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async replyToComment(
        @Param('commentId') commentId: string,
        @GetUser('sub') userId: string,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        this.logger.log(`User ${userId} replying to comment ${commentId}`);
        const data = await this.eventService.replyToComment(commentId, userId, createCommentDto);
        return {
            status: 'success',
            data: data,
            message: 'Reply created successfully',
        };
    }

    @Post(':id/like')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async likeEvent(
        @Param('id') eventId: string,
        @GetUser('sub') userId: string,
    ) {
        this.logger.log(`User ${userId} attempting to like event ${eventId}`);
        const data = await this.eventService.likeEvent(eventId, userId);
        return {
            status: 'success',
            data: data,
            message: 'Event liked successfully',
        };
    }

    @Post(':id/unlike')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async unlikeEvent(
        @Param('id') eventId: string,
        @GetUser('sub') userId: string,
    ) {
        this.logger.log(`User ${userId} attempting to unlike event ${eventId}`);
        const data = await this.eventService.unlikeEvent(eventId, userId);
        return {
            status: 'success',
            data: data,
            message: 'Event unliked successfully',
        };
    }

    @Post('post/:postId/upvote')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async upvotePost(
        @Param('postId') postId: string,
        @GetUser('sub') userId: string,
    ) {
        this.logger.log(`User ${userId} attempting to upvote post ${postId}`);
        const data = await this.eventService.upvotePost(postId, userId);
        return {
            status: 'success',
            data: data,
            message: 'Post upvoted successfully',
        };
    }

    @Post('post/:postId/remove-upvote')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN)
    async removeUpvote(
        @Param('postId') postId: string,
        @GetUser('sub') userId: string,
    ) {
        this.logger.log(`User ${userId} attempting to remove upvote from post ${postId}`);
        const data = await this.eventService.removeUpvote(postId, userId);
        return {
            status: 'success',
            data: data,
            message: 'Upvote removed successfully',
        };
    }
}
