import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { IExpense } from "@/models/IExpense";
import { GetServerSideProps } from "next";

import formatISO from "date-fns/formatISO";
import Link from "next/link";
import axios from "axios";

export const CreateExpense = () => {
  const [imageFile, setImageFile] = useState<File>();

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      var file = event.target.files[0];
      console.dir(file);
      setImageFile(file);
    }
  };
  const { query } = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const happenedAtRef = useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCreateExpense = async (e: any) => {
    e.preventDefault(); //Cancel the normal form submit behavior so that I can inspect the data.
    let happenedAtInISOFormat: string = "";
    let title: string = "";
    let amount: string = "0";
    const bodyFormData = new FormData();

    try {
      if (happenedAtRef.current !== null) {
        happenedAtInISOFormat = formatISO(new Date(happenedAtRef.current.value));
        console.log(`/expenses/[id].tsx>>Inspect [happenedAtInISOFormat] ${happenedAtInISOFormat}`);
        bodyFormData.append(`happenedAt`, happenedAtInISOFormat);
      }
      if (titleRef.current !== null) {
        title = titleRef.current.value;
        console.log(`/expenses/[id].tsx>>Inspect [title] ${title}`);
        bodyFormData.append(`title`, title);
      }
      if (amountRef.current !== null) {
        amount = amountRef.current.value;
        console.log(`/expenses/[id].tsx>>Inspect [amount] ${amount}`);
        bodyFormData.append(`amount`, amount);
      }
      if (imageFile !== null) {
        bodyFormData.append("file", imageFile as File);
      }
      await axios.post(`/api/expenses/`, bodyFormData);
    } catch (error) {
      //This error block is used to catch programmer error. e.g. variable is not defined etc.
      console.log(`/expenses/[id].tsx>>catch error block>>programmer error has occurred.`);
      console.log(error);

      //throw error;// (If you uncomment this, you will see the Next.JS black color window error output appearing)
    }
  }; //end of handleCreateExpense

  return (
    <>
      <div>
        <h3>Create expense</h3>
        <form>
          Title
          <br />
          <input type="text" id="title" name="title" ref={titleRef} />
          <br />
          Amount <br />
          <input type="text" id="title" name="title" ref={amountRef} />
          <br />
          Happened at <br />
          <input type="datetime-local" id="happened-at" name="happened-at" ref={happenedAtRef} />
          <br />
          <div>
            <div>
              <input accept={""} multiple={false} name="file" ref={fileInputRef} onChange={handleSelectFile} type="file" />
            </div>
            <button onClick={handleCreateExpense}>Submit</button>&nbsp;&nbsp;&nbsp;
            <Link href={"/expenses"} replace>
              Back to manage expenses
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateExpense;
