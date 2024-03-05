const SQL = require("@nearform/sql");
const DataLoader = require("dataloader");

module.exports = function builderDataLoader(app) {
  const dl = new DataLoader(
    async function fetcher(ids) {
      const secureIds = ids.map((id) => SQL`${id}`);
      const sql = SQL`SELECT * FROM person WHERE id IN (${SQL.glue(secureIds, ",")})
        `;
      const personData = await app.sqlite.all(sql);
      return ids.map((id) => personData.find((p) => `${p.id}` === `${id}`));
    },
    {
      cacheKeyFn: (key) => `${key}`,
    },
  );

  return dl;
};
