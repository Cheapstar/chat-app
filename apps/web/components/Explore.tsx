"use client";
import { useEffect, useState } from "react";
import { UserCard } from "./UserCard";
import { getUsers } from "../actions/getUsers";
import { UserType } from "../types/types";

export function Explore() {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    async function fetchUser() {
      const response = await getUsers();
      setUsers(response as UserType[]);

      console.log("Fetched Users", response);
    }

    fetchUser();
  }, []);

  return (
    <div className="bg-white h-[100%] rounded-md flex flex-col gap-2 overflow-scroll hide-scroll">
      {users.length > 0 ? (
        users.map((user) => {
          return (
            <div key={user.id}>
              <UserCard user={user} />
              <div className="flex justify-center pt-2">
                <hr className="w-[90%] text-gray-300"></hr>
              </div>
            </div>
          );
        })
      ) : (
        <p className="">*There are no users available</p>
      )}
    </div>
  );
}
