"use client";

import Navbar from "@/components/Navbar";
import { fetchStack, updateStack } from "@/lib/server/stacks";
import { Status } from "@/types/status";
import { Spinner, Textarea } from "@nextui-org/react";
import { Stack } from "@prisma/client";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StackPage() {
  return (
    <>
      <Navbar />

      <Components />
    </>
  );
}

function Components() {
  const path = usePathname();
  const [stack, setStack] = useState<Stack | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ReactNode>(<></>);

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    const id = path.split("/").pop();
    if (!id) {
      setStatus("error");
      setError(new Error("Invalid stack ID"));
      return;
    }

    setStatus("loading");

    fetchStack(id)
      .then((stack) => {
        setStack(stack);
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setError(e);
      });
  }, [stack]);

  if (status === "loading" || !stack) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-12">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error?.message}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start gap-12 p-12">
      <div className="flex w-fit flex-col items-start justify-start gap-2">
        <h1
          className="w-fit text-4xl font-bold"
          contentEditable
          onBlur={async (e) => {
            if (stack.name === e.target.textContent) {
              return;
            }

            setUpdateStatus(SavingChangesStatus);

            await updateStack(stack.id, {
              ...stack,
              name: e.target.textContent || "",
            })
              .catch((e) => {
                setUpdateStatus(e.message);
              })
              .then(() => {
                setStack({ ...stack, name: e.target.textContent || "" });
                setUpdateStatus("Stack name updated.");
              });
          }}
        >
          {stack.name}
        </h1>
        <p
          className="w-fit text-base text-gray-500"
          contentEditable
          onBlur={async (e) => {
            if (stack.description === e.target.textContent) {
              return;
            }

            await updateStack(stack.id, {
              ...stack,
              description: e.target.textContent || "",
            })
              .catch((e) => {
                setUpdateStatus(e.message);
              })
              .then(() => {
                setStack({ ...stack, description: e.target.textContent || "" });
                setUpdateStatus("Stack description updated.");
              });
          }}
        >
          {stack.description}
        </p>

        <p className="text-base text-gray-500">{updateStatus}</p>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-12">
        <Textarea
          value={stack.content}
          onChange={(e) => setStack({ ...stack, content: e.target.value })}
          onBlur={async (e) => {
            setUpdateStatus(SavingChangesStatus);

            await updateStack(stack.id, {
              ...stack,
            })
              .catch((e) => {
                setUpdateStatus(e.message);
              })
              .then(() => {
                setUpdateStatus("Stack content updated.");
              });
          }}
          className="w-full"
        />

        <Markdown className="markdown" remarkPlugins={[remarkGfm]}>
          {stack.content}
        </Markdown>
      </div>
    </main>
  );
}

function SavingChangesStatus() {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <p className="text-base text-gray-500">Saving changes</p>
      <Spinner size="sm" color="default" />
    </div>
  );
}
