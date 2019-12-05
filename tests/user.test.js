const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')

const {
    userOneId,
    userOne,
    setUpDatabase
} = require('./fixtures/db')


describe('User API', () => {
    beforeEach(setUpDatabase)

    it('Should sign up a new user', async () => {
        const response = await request(app).post('/users').send({
            name: 'Andrew',
            email: 'andrew@example2.com',
            password: 'Mypass777!'
        }).expect(201)

        // Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()

        //Assert the response
        expect(response.body).toMatchObject({
            user: {
                name: 'Andrew',
                email: 'andrew@example2.com',
            },
            token: user.tokens[0].token
        })

        // Check if password was encrypted
        expect(user.password).not.toBe('Mypass777!')
    })

    it('Should login exisiting user', async () => {
        const response = await request(app).post('/users/login').send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)
        const user = await User.findById(userOneId)
        expect(response.body.token).toBe(user.tokens[1].token)
    })

    it('Should not login nonexistent user', async () => {
        await request(app).post('/users/login').send({
            email: userOne.email,
            password: 'userOne.password'
        }).expect(400)
    })

    it('Should get profile for user', async () => {
        await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    it('Should not get profile for unauthenticated user', async () => {
        await request(app)
            .get('/users/me')
            .send()
            .expect(401)
    })

    it('Should delete profile for user', async () => {
        await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
        const user = await User.findById(userOneId)
        expect(user).toBeNull()
    })

    it('Should not delete profile for unauthenticated user', async () => {
        await request(app)
            .get('/users/me')
            .send()
            .expect(401)
    })

    it('Should upload avatar image', async () => {
        await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/sample.png')
            .expect(200)
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
    })

    it('Should update valid user fields', async () => {
        await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                name: 'Tommy'
            })
            .expect(200)
        const user = await User.findById(userOneId)
        expect(user.name).toBe('Tommy')
    })

    it('Should not update invalid user fields', async () => {
        await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                surname: 'Tommy'
            })
            .expect(400)
    })
})