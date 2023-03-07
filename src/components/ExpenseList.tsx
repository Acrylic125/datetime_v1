import { useRouter } from "next/router";
import { IExpense } from "@/models/IExpense";
import Card from "@mui/material/Card";
import { CardActions, CardContent, Button, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";

interface PageProp {
  expenses: IExpense[];
}

export const ExpenseList = ({ expenses = [] }: PageProp) => {
  const router = useRouter();

  return (
    <div>
      {expenses.map((expense: IExpense) => (
        <Card key={expense.id}>
          <CardActions>
            <Button onClick={() => router.push(`/expenses/${expense.id}`)}>Update</Button>
          </CardActions>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {expense.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expense.amount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(parseISO(expense.happenedAt.toString()), "yyyy-MM-dd HH:mm a")}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
