"use client";

import { startTransition, useActionState } from "react";
import { createUserAction, CreateUserState } from "../_lib/create-user-action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


export function UserCreateForm() {
  const initialState: CreateUserState = {};
  const [state, dispatch] = useActionState(createUserAction, initialState);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    startTransition(() => dispatch(formData));
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" />
        {state.errors?.name?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Label htmlFor="email">Email</Label>
        <Input name="email" id="email" />
        {state.errors?.email?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Label htmlFor="emailVerified">Email Verified</Label>
        <Input name="emailVerified" id="emailVerified" />
        {state.errors?.emailVerified?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Label htmlFor="image">Image</Label>
        <Input name="image" id="image" />
        {state.errors?.image?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Label htmlFor="role">Role</Label>
        <Input name="role" id="role" />
        {state.errors?.role?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Label htmlFor="password">Password</Label>
        <Input name="password" id="password" />
        {state.errors?.password?.map((error) => (
          <FormMessage key={error} variant="error">{error}</FormMessage>
        ))}
      </FormControl>
      <FormControl>
        <Button type="submit">Submit</Button>
      </FormControl>
      {state.message && <FormMessage variant={state.status}>{state.message}</FormMessage>}
    </Form>
  );
}
