import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    throw new Error("Not signed in");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    throw new Error("Not signed in");
  }

  // ✅ Ensure ID is always a string for MongoDB
  return {
    currentUser: {
      ...currentUser,
      id: currentUser.id.toString(),
    },
  };
};

export default serverAuth;
