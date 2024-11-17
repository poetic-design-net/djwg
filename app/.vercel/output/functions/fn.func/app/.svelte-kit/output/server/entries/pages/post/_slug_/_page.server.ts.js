import { a as postQuery } from "../../../../chunks/queries.js";
const load = async (event) => {
  const { loadQuery } = event.locals;
  const { slug } = event.params;
  const params = { slug };
  const initial = await loadQuery(postQuery, params);
  return {
    query: postQuery,
    params,
    options: { initial }
  };
};
export {
  load
};
