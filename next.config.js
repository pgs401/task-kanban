/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-beautiful-dnd is not compatible with React 18 StrictMode in dev
  // (Droppable breaks). Disabling avoids the known double-invoke issue.
  reactStrictMode: false,
};

module.exports = nextConfig;
