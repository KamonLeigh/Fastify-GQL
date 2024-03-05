const SQL = require("@nearform/sql");
const DataLoader = require("dataloader");

module.exports = function builderDataLoader(app) {
  const dl = new DataLoader(
    async function fetcher(ids) {
      const secureIds = ids.map((id) => SQL`${id}`);
      const sql = SQL`SELECT * FROM person WHERE id IN (${SQL.glue(secureIds, ",")})
        `;
    },
    {
      cacheKeyFn: (key) => `${key}`,
    },
  );
};
