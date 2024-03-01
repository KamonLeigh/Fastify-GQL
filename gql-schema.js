module.exports = `
  # the GQL Schema string

  type Family {
    id: ID!
    name: String!
    members: [Person!]!
  }

  type Person {
    id: ID!
    family: Family!
    fullName: String!
    nickName: String
    friends: [Person!]!
  }

  type Query {
    family(id: ID!): Family
    person(id: ID!): Person
  }

  type Mutation {
   changeNickName(id: ID!, nickName: String!): Person
  }

  type Subscription {
    personChanged: Person
  }
`;
