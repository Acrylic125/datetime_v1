import { GetServerSideProps } from "next";
import { ExpenseList } from "@/components/ExpenseList";
import { IExpense } from "@/models/IExpense";

interface DataProp {
  expenses: IExpense[];
}

const ManageExpenses = ({ expenses }: DataProp) => {
  return <ExpenseList expenses={expenses} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3000/api/expenses`);
  console.log(res);
  const expenses = (await res.json()).data;
  console.log(`src\pages\expenses\index.tsx>>Inspect [expenses]`);
  console.log(expenses);
  return {
    props: { expenses: expenses ?? [] },
  };
};

export default ManageExpenses;
