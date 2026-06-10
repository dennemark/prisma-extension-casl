import { PrismaClient } from '../src/generated/prisma/client'

export async function seed(prisma: PrismaClient) {
    // Use sequential operations instead of batch transaction for Prisma 7 compatibility
    await prisma.post.deleteMany()
    await prisma.thread.deleteMany()
    await prisma.user.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.user.createMany({
        data: [{
            id: 0,
            email: '0'
        }, {
            id: 1,
            email: '1'
        }]
    })
    await prisma.topic.createMany({
        data: [{
            id: 0
        }, {
            id: 1
        }]
    })
    await prisma.thread.createMany({
        data: [{
            id: 0,
            creatorId: 0,
            topicId: 0
        }, {
            id: 1,
            creatorId: 1,
            topicId: 0
        }, {
            id: 2,
            creatorId: 0,
            topicId: 1
        }]
    })
    await prisma.post.createMany({
        data: [{
            id: 0,
            text: '',
            authorId: 0,
            threadId: 0,
        }, {
            id: 1,
            text: '',
            authorId: 1,
            threadId: 0
        }, {
            id: 2,
            text: '',
            authorId: 1,
            threadId: 1
        }, {
            id: 3,
            text: '',
            authorId: 0,
            threadId: 2
        }]
    })
    await prisma.user.update({
        where: {
            id: 0
        },
        data: {
            favoriteId: 0
        }
    })
}
