"use client";

import Navbar from "@/components/Navbar";
import { fetchStack, updateStack } from "@/lib/server/stacks";
import { Status } from "@/types/status";
import { Button, Spinner, Textarea } from "@nextui-org/react";
import { Stack } from "@prisma/client";
import { usePathname } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { useEditor, EditorContent, Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "@/components/Toolbar";
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
  const path = usePathname();
  const [stack, setStack] = useState<Stack | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [updateStatus, setUpdateStatus] = useState<Status>("idle");

  const editor = useEditor({
    content: stack?.content,
    extensions: [StarterKit.configure()],
    onUpdate: ({ editor }) => {
      if (!stack) {
        return;
      }

      setStack({ ...stack, content: editor.getHTML() });
    },
    onBlur: async () => {
      if (!stack) {
        return;
      }

      setUpdateStatus("loading");

      await updateStack(stack.id, {
        ...stack,
      })
        .catch((e) => {
          setUpdateStatus(e.message);
        })
        .then(() => {
          setUpdateStatus("success");
        });
    },
  });

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

        editor?.commands.setContent(stack?.content as Content);
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

  return (
    <main className="flex min-h-screen flex-col items-start justify-start gap-4 p-12">
      <div className="flex w-fit flex-col items-start justify-start gap-2">
        <h1
          className="w-fit text-4xl font-bold"
          contentEditable
          onBlur={async (e) => {
            if (stack.name === e.target.textContent) {
              return;
            }

            setUpdateStatus("loading");

            await updateStack(stack.id, {
              ...stack,
              name: e.target.textContent || "",
            })
              .catch((e) => {
                setUpdateStatus(e.message);
              })
              .then(() => {
                setStack({ ...stack, name: e.target.textContent || "" });
                setUpdateStatus("success");
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

            setUpdateStatus("loading");

            await updateStack(stack.id, {
              ...stack,
              description: e.target.textContent || "",
            })
              .catch((e) => {
                setUpdateStatus("error");
                setError(e);
              })
              .then(() => {
                setStack({ ...stack, description: e.target.textContent || "" });
                setUpdateStatus("success");
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

        {updateStatus === "error" && (
          <p className="text-base text-red-500">An error has occurred.</p>
        )}

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
        onClick={async () => {
          setUpdateStatus("loading");

          updateStack(stack.id, stack)
            .catch((e) => {
              setUpdateStatus("error");
              setError(e);
            })
            .then(() => {
              setUpdateStatus("success");
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
