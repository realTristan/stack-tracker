"use client";

import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Stack } from "@prisma/client";
import Link from "next/link";
import { deleteStack, fetchStacks, createStack } from "@/lib/server/stacks";
import { useEffect, useState } from "react";
import { Status } from "@/types/status";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <Components />
    </>
  );
}

function Components(): JSX.Element {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [action, setAction] = useState<"creating" | "deleting" | null>(null);
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null);

  const router = useRouter();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    setStatus("loading");

    fetchStacks()
      .then((stacks) => {
        setStacks(stacks);
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setError(e);
      });
  }, [stacks]);

  if (status === "loading") {
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
        <p className="text-lg text-gray-500">{error?.message}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-start gap-4 p-12">
      <div className="flex w-full flex-col items-start justify-start gap-2">
        <h1 className="text-4xl font-bold">Stacks</h1>
        <p className="text-base text-gray-500">
          Manage your tech stacks with ease.
        </p>
      </div>

      <Table shadow="none">
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {stacks.map((stack) => (
            <TableRow key={stack.id}>
              <TableCell>{stack.name}</TableCell>
              <TableCell>{stack.description}</TableCell>
              <TableCell className="flex flex-row items-center justify-start gap-2">
                <Button
                  as={Link}
                  href={`/stack?id=${stack.id}`}
                  color="primary"
                >
                  View
                </Button>

                <Button
                  color="danger"
                  onClick={() => {
                    setSelectedStack(stack);
                    onOpen();
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => {
            if (!selectedStack) {
              return null;
            }

            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Delete {selectedStack.name}
                </ModalHeader>
                <ModalBody>
                  <p className="text-lg text-gray-500">
                    Are you sure you want to delete this stack? This action
                    cannot be undone.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    disabled={action === "deleting"}
                    className="flex items-center justify-center disabled:opacity-50"
                    onPress={async () => {
                      setAction("deleting");

                      await deleteStack(selectedStack.id)
                        .catch((e) => {
                          setStatus("error");
                          setError(e);
                        })
                        .then(() => {
                          setStacks(
                            stacks.filter((s) => s.id !== selectedStack.id),
                          );

                          onClose();
                        });

                      setAction(null);
                      setSelectedStack(null);
                    }}
                  >
                    {action === "deleting" ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      <Button
        color="default"
        disabled={action === "creating"}
        className="flex items-center justify-center disabled:opacity-50"
        onClick={async () => {
          setAction("creating");

          await createStack()
            .catch((e) => {
              setStatus("error");
              setError(e);
            })
            .then((stack) => {
              if (!stack) {
                return;
              }

              router.push(`/stack?id=${stack.id}`);
            });

          setAction(null);
        }}
      >
        {action === "creating" ? (
          <Spinner size="sm" color="white" />
        ) : (
          "Create new stack"
        )}
      </Button>
    </main>
  );
}
