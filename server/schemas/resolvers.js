const { User, Thought } = require('../models');

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
    }
};

module.exports = resolvers