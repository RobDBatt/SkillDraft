import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Category pages used to live at /explore/<category>; Google still has
  // those URLs indexed and they 404. They moved to /explore/c/<category>.
  async redirects() {
    return [
      {
        source:
          "/explore/:category(development|frontend-design|content-writing|data-integrations|project-workflows|devops-infrastructure|security|backend-frameworks|git-version-control|database-sql|custom-other)",
        destination: "/explore/c/:category",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
