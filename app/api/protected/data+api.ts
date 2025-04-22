import { withAuth } from "~/lib/middleware";

const mockData = {
  secretMessage: "This is protected data!",
  timestamp: new Date().toISOString(),
};

export const GET = withAuth(async (req, user) => {
  return Response.json({
    data: mockData,
    user: {
      name: user.name,
      email: user.email,
    },
  });
});
