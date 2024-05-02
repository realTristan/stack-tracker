"use server";

import { Stack } from "@prisma/client";
import { prisma } from "../prisma";
import { v4 as uuidv4 } from "uuid";

export const isValidStack = (stack: Stack) => {
  if (stack.description.length < 1 || stack.description.length > 255) {
    return false;
  }

  if (stack.name.length < 1 || stack.name.length > 255) {
    return false;
  }

  if (stack.content.length < 1 || stack.content.length > 65535) {
    return false;
  }

  return true;
};

export async function fetchStack(id: string) {
  "use server";

  const stack = await prisma.stack.findFirst({
    where: {
      id,
    },
  });

  return stack;
}

export async function fetchStacks() {
  "use server";

  const stacks = await prisma.stack.findMany();

  return stacks;
}

export async function createStack() {
  "use server";

  const stack = await prisma.stack.create({
    data: {
      id: uuidv4(),
      name: "New Stack",
      description: "A new stack",
      content: "Your New Stack",
    },
  });

  return stack;
}

export async function deleteStack(id: string) {
  "use server";

  return await prisma.stack.delete({
    where: {
      id,
    },
  });
}

export async function updateStack(id: string, data: Stack) {
  "use server";

  if (!isValidStack(data)) {
    throw new Error("Invalid stack data");
  }

  const stack = await prisma.stack.update({
    where: {
      id,
    },
    data,
  });

  return stack;
}
