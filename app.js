const Fastify = require("fastify");
const SQL = require("@nearform/sql");
const mercuius = require("mercurius");
const gqlSchmea = require("./gql-schema");

const resolvers = {
  Query: {
    family: async function familyFunc(_parent, args, context, _info) {
      context.reply.log.info("TODO is business logic");
      // return {
      //   id: 62,
      //   name: "Demo",
      // };

      const sql = SQL`SELECT * FROM Family WHERE id = ${args.id}`;
      const familyData = context.app.sqlite.get(sql);
      context.reply.log.debug({ familyData }, "Read family data");

      return familyData;
    },
    person: async function personFunc(_parent, args, context, info) {
      context.reply.log.info("Find person");
      const sql = SQL`SELECT * FROM Person WHERE id = ${args.id}`;
      const person = context.app.sqlite.get(sql);

      return person;
    },
  },
  Mutation: {
    changeNickName: async function changeNickName(parent, args, context, info) {
      const sql = SQL`UPDATE PERSON SET nick=${args.nickName} WHERE id=${args.id} `;
      const { change } = context.app.sqlite.run(sql);

      if (change === 0) {
        throw new Error("error in updating person");
      }

      const sqlTwo = SQL`SELECT * FROM Person WHERE id = ${args.id}`;

      const person = context.app.sqlite.get(sqlTwo);
      context.reply.log.debug({ person }, "Read updated person");
      return person;
    },
    addToFamily: async function addToFamily(parent, args, context, info) {
      const sql = SQL`INSERT INTO Person (familyId, name, nick) VALUES(${args.id}, ${args.name}, ${args.nickName})`;
      const { lastID, changes } = await context.app.sqlite.run(sql);

      if (changes === 0 || changes === undefined) {
        throw new Error("Unable to inser new Person");
      }

      const sqlTwo = SQL`SELECT * FROM Person WHERE id = ${lastID}`;
      const person = context.app.sqlite.get(sqlTwo);
      context.reply.log.debug({ person }, "Read updated person");

      return person;
    },
  },
  Family: {
    members: async function membersFunc(parent, args, context, info) {
      const sql = SQL`SELECT * FROM Person WHERE familyId = ${parent.id}`;
      const membersData = context.app.sqlite.all(sql);
      return membersData;
    },
  },
  Person: {
    nickName: async function nickNameFunc(parent, args, context, info) {
      return parent.nick;
    },
    fullName: async function fullName(parent, args, context, info) {
      const sql = SQL`SELECT * FROM Family WHERE id = ${parent.familyId}`;
      const familyData = await context.app.sqlite.get(sql);

      return `${parent.name} ${familyData.name}`;
    },
    friends: async function friendsFunc(parent, args, context, info) {
      const sql = SQL`SELECT * FROM Person WHERE id IN (SELECT friendId FROM Friend WHERE personId = ${parent.id})`;
      const friendData = await context.app.sqlite.all(sql);
      return friendData;
    },
    family: async function familyFunc(parent, args, context, info) {
      const sql = SQL`SELECT * FROM Family WHERE id = ${parent.familyId}`;
      const familyData = await context.app.sqlite.get(sql);
      return familyData;
    },
  },
};

async function run() {
  const app = Fastify({ logger: { level: "debug" } });

  await app.register(require("fastify-sqlite"), {
    verbose: true,
    promiseApi: true,
  });

  await app.sqlite.migrate({
    migrationPath: "migrations/",
  });

  app.register(mercuius, {
    schema: gqlSchmea,
    graphiql: true,
    resolvers,
  });

  await app.listen({ port: 3003 });
}

run();
