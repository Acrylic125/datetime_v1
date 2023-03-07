export interface IExpense {
  id?: string;
  title: string;
  amount: number;
  happenedAt: Date;
  imageUrl?: string;
  imagePublicId?: string;
  originalFileName?: string;
  imageWidth?: number;
  imageHeight?: number;
}
