import groq from "groq";
const postQuery = groq`*[_type == "post" && slug.current == $slug][0]`;
const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`;
export {
  postQuery as a,
  postsQuery as p
};
