import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { IExpense } from "@/models/IExpense";
import { GetServerSideProps } from "next";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import axios from "axios";
import formatISO from "date-fns/formatISO";
interface DataProp {
  expense: IExpense;
}
export const UpdateExpense = ({ expense }: DataProp) => {
  const [imageFile, setImageFile] = useState<File>();

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      var file = event.target.files[0];
      setImageFile(file);
    }
  };
  const { query } = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const happenedAtRef = useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const hiddenImagePublicIdRef = React.useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    //Important reference: https://webreflection.medium.com/using-the-input-datetime-local-9503e7efdce
    //https://reactjs.org/docs/hooks-effect.html
    //https://www.smashingmagazine.com/2020/11/react-useref-hook/
    //https://webreflection.medium.com/using-the-input-datetime-local-9503e7efdce
    console.log(`/expenses/[id].tsx>>useEffect []>>initializing the input elements by using the useEffect technique`);
    if (titleRef.current !== null) {
      titleRef.current.value = expense.title;
    }
    if (amountRef.current !== null) {
      amountRef.current.value = expense.amount.toString();
    }

    if (happenedAtRef.current !== null) {
      happenedAtRef.current.value = format(parseISO(expense.happenedAt.toString()), "yyyy-MM-dd HH:mm");
    }
    if (hiddenImagePublicIdRef.current !== null) {
      hiddenImagePublicIdRef.current.value = expense?.imagePublicId + "";
    }
  }, []);

  const handleUpdate = async (e: any) => {
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
      if (hiddenImagePublicIdRef.current !== null) {
        bodyFormData.append(`imagePublicId`, hiddenImagePublicIdRef.current.value);
      }
      if (imageFile !== null) {
        bodyFormData.append("file", imageFile as File);
      }
      await axios.put(`/api/expenses/${expense.id}`, bodyFormData);
    } catch (error) {
      //This error block is used to catch programmer error. e.g. variable is not defined etc.
      console.log(`/expenses/[id].tsx>>catch error block>>programmer error has occurred.`);
      console.log(error);

      //throw error;// (If you uncomment this, you will see the Next.JS black color window error output appearing)
    }
  }; //end of handleUpdateProject

  const handleDelete = async (e: any) => {
    e.preventDefault(); //Cancel the normal form submit behavior so that I can inspect the data.
    try {
    } catch (error) {
      //This error block is used to catch programmer error. e.g. variable is not defined etc.
      console.log(error);
      alert(`/expenses/[id].tsx>>inspect [error] inside the handleDelete main try-catch block. ${error}`);
      //throw error;// (If you uncomment this, you will see the Next.JS black color window error output appearing)
    }
  }; //end of handleDelete

  return (
    <>
      <p>Expense record id: {query.id}</p>
      <h2>{expense.title}</h2>
      <h2>{expense.amount}</h2>
      <h2> {format(parseISO(expense.happenedAt.toString()), "yyyy-MM-dd HH:mm a")} </h2>

      <div>
        <h3>Update expense</h3>
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
          <br />
          <input type="hidden" id="image-public-id" name="image-public-id" ref={hiddenImagePublicIdRef} />
          <br />
          <div>
            <div>
              <input accept={""} multiple={false} name="file" ref={fileInputRef} onChange={handleSelectFile} type="file" />
            </div>
            <div>
              <img src={expense.imageUrl} />
            </div>
            <button onClick={handleUpdate}>Submit</button>&nbsp;&nbsp;&nbsp;
            <button onClick={handleDelete}>Delete</button>&nbsp;&nbsp;&nbsp;
            <Link href={"/expenses"} replace>
              Back to manage expenses
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let expense;
  let responseData;
  if (context?.params) {
    const id = context.params.id; // Get id value from slug `/expenses/1`
    const res = await fetch(`http://localhost:3000/api/expenses/${id}`);
    responseData = await res.json();
    console.log(`Inspect [responseData?.data]`);
    console.log(responseData?.data);
    expense = responseData?.data[0];
  }
  //Rest of `getServerSideProps` code
  if (!expense) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else {
    return {
      props: { expense },
    };
  }
};
export default UpdateExpense;
