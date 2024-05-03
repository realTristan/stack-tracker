"use client";

import Navbar from "@/components/Navbar";
import { fetchStack, updateStack } from "@/lib/server/stacks";
import { Status } from "@/types/status";
import { Button, Spinner } from "@nextui-org/react";
import { Stack } from "@prisma/client";
import React, { useEffect, useState } from "react";
import Tiptap from "@/components/Tiptap";

export default function StackPage() {
  return (
    <>
      <Navbar />

      <Components />
    </>
  );
}

function Components() {
  const [stack, setStack] = useState<Stack | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [updateStatus, setUpdateStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");

    if (!id) {
      return setError(new Error("Stack ID not found"));
    }

    setStatus("loading");

    fetchStack(id)
      .catch((e) => {
        setStatus("error");
        setError(e);
      })
      .then((stack) => {
        if (!stack) {
          setStatus("error");
          return setError(new Error("Stack not found"));
        }

        setStatus("success");
        setStack(stack);
      });
  }, []);

  if (status === "loading" || !stack) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-12">
        <Spinner size="lg" color="primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start gap-4 p-12">
      <div className="flex w-fit flex-col items-start justify-start gap-2">
        <h1
          className="w-fit text-4xl font-bold"
          contentEditable
          onBlur={async (e) => {
            const newName = e.target.textContent || "";

            if (stack.name === newName) {
              return;
            }

            if (newName.length < 1 || newName.length > 255) {
              return setError(
                new Error(
                  "Name must be at least 1 character and max 255 characters",
                ),
              );
            }

            setStack({ ...stack, name: newName });

            setUpdateStatus("loading");

            await updateStack(stack.id, {
              ...stack,
              name: newName,
            })
              .catch((e) => {
                setUpdateStatus("error");
                setError(e);
              })
              .then(() => {
                setUpdateStatus("success");
                setError(null);
              });
          }}
        >
          {stack.name}
        </h1>
        <p
          className="w-fit text-base text-gray-500"
          contentEditable
          onBlur={async (e) => {
            const newDescription = e.target.textContent || "";
            if (stack.description === newDescription) {
              return;
            }

            if (newDescription.length < 1 || newDescription.length > 255) {
              return setError(
                new Error(
                  "Description must be at least 1 character and max 255 characters",
                ),
              );
            }

            setStack({ ...stack, description: newDescription });

            setUpdateStatus("loading");

            await updateStack(stack.id, {
              ...stack,
              description: newDescription,
            })
              .catch((e) => {
                setUpdateStatus("error");
                setError(e);
              })
              .then(() => {
                setUpdateStatus("success");
                setError(null);
              });
          }}
        >
          {stack.description}
        </p>

        {updateStatus === "loading" && (
          <div className="flex flex-row items-center justify-center gap-2">
            <p className="text-base text-gray-500">Saving changes</p>
            <Spinner size="sm" color="default" />
          </div>
        )}

        {error && <p className="text-base text-red-500">{error.message}</p>}

        {updateStatus === "success" && (
          <p className="text-base text-green-500">Changes saved.</p>
        )}
      </div>

      <Tiptap
        content={stack.content}
        onChange={async (richText) => {
          setStack({ ...stack, content: richText });
        }}
      />

      <Button
        color="default"
        disabled={updateStatus === "loading"}
        className="flex items-center justify-center disabled:opacity-50"
        onClick={async (e) => {
          if (stack.content.length < 1 || stack.content.length > 65535) {
            return setError(
              new Error(
                "Content must be at least 1 character and max 65535 characters",
              ),
            );
          }

          setUpdateStatus("loading");

          updateStack(stack.id, stack)
            .catch((e) => {
              setUpdateStatus("error");
              setError(e);
            })
            .then(() => {
              setUpdateStatus("success");
              setError(null);
            });
        }}
      >
        {updateStatus !== "loading" ? (
          "Save changes"
        ) : (
          <Spinner size="sm" color="white" />
        )}
      </Button>
    </main>
  );
}
