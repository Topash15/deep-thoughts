const { User, Thought } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // gets all thoughts if args are empty
    // otherwise all thoughts by username
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    // gets thought by id
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
    // gets all users
    users: async () => {
      return User.find()
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },
    // gets single user by username
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },
    // gets current user
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("friends")
          .populate("thoughts");

        return userData;
      }

      throw new AuthenticationError('Not logged in')
    },
  },
  Mutation: {
    // creates a new user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    // logs user in
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      // if no user is found, return error
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      // if password is incorrect or missing, return error
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    // creates a new thought
    addThought: async (parent, args, context) => {
        if(context.user) {
            const thought = await Thought.create({ ...args, username: context.user.username});

            await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { thoughts: thought._id } },
                { new: true }
            );
                console.log (context.user)
            return thought;
        }

        throw new AuthenticationError("You need to be logged in to create a new thought!");
    },

    // creates a new reaction
    addReaction: async ( parent, { thoughtId, reactionBody}, context ) => {
        if(context.user){
            const updatedThought = await Thought.findOneAndUpdate(
                { _id: thoughtId },
                { $push: { reactions : {reactionBody, username: context.user.username }}},
                { new: true, runValidators: true}
            );

        return updatedThought;
        }

        throw new AuthenticationError("You need to be logged in to create a new reaction!")
    },

    // adds a new friend
    addFriend: async (parent, { friendId }, context ) => {

        if (context.user){
            console.log({user: context.user , friend: friendId})
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $push: { friends: friendId }},
                { new: true}
            ).populate('friends');

            return updatedUser;
        }

        throw new AuthenticationError("You need to be logged in to add a new friend!");
    }
  },
};

module.exports = resolvers;
