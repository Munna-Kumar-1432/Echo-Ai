"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () =>{
    authClient.signUp.email({
      email,
      name,
      password
    },
    {
      onError:()=>{
        window.alert("something went wrong")
      },
      onSuccess:()=>{
        window.alert("Success")
      }
    }
  
  )
  }

  const { data: session} = authClient.useSession() 

  if(session){
    return (
     <>
      <p>Login ined</p>
      <Button onClick={()=>authClient.signOut()}>Signout</Button>
     </>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <Input
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="name"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
      type="password"
        placeholder="name"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={onSubmit}>Create User</Button>
    </div>
  );
}
