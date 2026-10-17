/** Static export: the whole portfolio is plain HTML/CSS/JS, deployable to Vercel, Netlify or GitHub Pages. */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
