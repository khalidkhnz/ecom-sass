"use client";

import { notFound } from "next/navigation";
import { deleteUserAction, DeleteUserState } from "../_lib/delete-user-action";
import { Button } from "@/components/ui/button";
import { startTransition, useActionState } from "react";
import { User } from "@/schema/users";
import { Form, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

export function UserDeleteForm({ userRow }: { userRow?: User }) {
  const initialState: DeleteUserState = {};
  const [state, dispatch] = useActionState(deleteUserAction, initialState);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    startTransition(() => dispatch(formData));
  }

  if (!userRow && state.message) {
    return <FormMessage variant={state.status}>{state.message}</FormMessage>
  }

  if (!userRow) {
    notFound();
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Label htmlFor="id"><strong>Id:</strong> { userRow.id }</Label>
        <input type="hidden" name="id" id="id" value={ userRow.id } />
      </FormControl>
      <FormControl>
        <Button variant="destructive" type="submit">
          Delete
        </Button>
      </FormControl>
      {state.message && <FormMessage variant={state.status}>{state.message}</FormMessage>}
    </Form>
  );
}
