"use strict";
const SQL = require("@nearform/sql");
const DataLoader = require("dataloader");

module.exports = function buildDataLoader(app) {
  const dl = new DataLoader(
    async function fetcher(ids) {
      const secureIds = ids.map((id) => SQL`${id}`);
      console.log("secureIds", secureIds);
      const sql = SQL`SELECT * FROM Family WHERE id IN (${SQL.glue(secureIds, ",")})`;
      const familyData = await app.sqlite.all(sql);
      const result = ids.map((id) =>
        familyData.find((f) => `${f.id}` === `${id}`),
      );
      return result;
    },
    {
      cacheKeyFn: (key) => `${key}`,
    },
  );
  console.log("dl", dl);
  return dl;
};
