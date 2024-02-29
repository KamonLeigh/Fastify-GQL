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
  },
};

async function run() {
  const app = Fastify({ logger: { level: "debug" } });

  await app.register(require("fastify-sqlite"), {
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
