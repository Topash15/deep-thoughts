const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express')

const resolvers = {
    Query: {
        // gets all thoughts if args are empty
        // otherwise all thoughts by username
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {}
            return Thought.find(params).sort({ createdAt: -1 })
        },
        // gets thought by id
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        // gets all users
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts')
        },
        // gets single user by id
        user: async (parent, { _id }) => {
            return User.findOne({ _id })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts')
        }
    },
    Mutation: {
        // creates a new user
        addUser: async (parent, args) => {
            const user = await User.create(args);

            return user;
        },

        // logs user in
        login: async (parent, { email, password})=> {
            const user = await User.findOne({ email });

            // if no user is found, return error
            if (!user) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const correctPw = await user.isCorrectPassword(password);

            // if password is incorrect or missing, return error
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            return user;
        },
    }
};

module.exports = resolvers