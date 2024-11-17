import { p as postsQuery } from "../../chunks/queries.js";
const load = async (event) => {
  const { loadQuery } = event.locals;
  const initial = await loadQuery(postsQuery);
  return {
    query: postsQuery,
    options: { initial }
  };
};
export {
  load
};
