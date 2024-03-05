const SQL = require("@nearform/sql");
const DataLoader = require("dataloader");

module.exports = function builderDataLoader(app) {
  const dl = new DataLoader(
    async function fetcher(ids) {
      const secureIds = ids.map((id) => SQL`${id}`);
      const sql = SQL`SELECT * FROM Friend WHERE personId IN (${SQL.glue(secureIds, ",")})`;
      const friendData = await app.sqlite.all(sql);

      const result = ids.map((id) =>
        friendData.filter((f) => `${f.personId}` === `${id}`),
      );
      console.log("xxx", result);
      return result;
    },
    {
      cacheKeyFn: (key) => `${key}`,
    },
  );
  return dl;
};
