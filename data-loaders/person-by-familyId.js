const SQL = require("@nearform/sql");
const DataLoader = require("dataloader");

module.exports = function builderDataLoader(app) {
  const dl = new DataLoader(
    async function fetcher(ids) {
      console.log("ids", ids);
      const secureIds = ids.map((id) => SQL`${id}`);
      const sql = SQL`SELECT * FROM Person WHERE familyId IN (${SQL.glue(secureIds, ",")})`;
      const personData = await app.sqlite.all(sql);
      console.log("personData", personData);
      const result = ids.map((id) =>
        personData.filter((f) => `${f.familyId}` === `${id}`),
      );
      console.log("result_f", result);
      return result;
    },
    {
      cacheKeyFn: (key) => `${key}`,
    },
  );
  return dl;
};
