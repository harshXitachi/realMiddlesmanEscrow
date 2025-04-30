import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroup } from "@/components/ui/button-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsertTransaction } from "@shared/schema";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  currency: z.string().default("USD"),
  receiverId: z.number().optional(),
  receiverEmail: z.string().email("Please enter a valid email").optional(),
  dueDate: z.string().optional(),
});

type TransactionFormProps = {
  onSubmit: (data: InsertTransaction) => void;
  isSubmitting: boolean;
};

export function TransactionForm({ onSubmit, isSubmitting }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<"buyer" | "seller">("buyer");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      currency: "USD",
      dueDate: ""
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, we'd look up the receiver ID by email
    // For now, we'll use a dummy ID
    const receiverId = 2; // This would be fetched from the API in a real app
    
    onSubmit({
      title: values.title,
      description: values.description || "",
      amount: parseFloat(values.amount), 
      currency: values.currency,
      receiverId,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      // These would be set by the server
      transactionId: "", 
      initiatorId: 0,
      progress: 0,
      status: "pending"
    });
  };

  return (
    <Form {...form}>
      <form id="transaction-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Transaction Type</label>
          <ButtonGroup className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`py-3 px-4 border ${
                transactionType === "buyer"
                  ? "border-blue-400 bg-blue-500/10 dark:border-blue-600 dark:bg-blue-900/30"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg text-center hover:bg-blue-500/10 dark:hover:bg-blue-900/20 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onClick={() => setTransactionType("buyer")}
            >
              <span className="material-icons mb-1">account_balance</span>
              <p className="text-sm font-medium">Buyer</p>
            </button>
            <button
              type="button"
              className={`py-3 px-4 border ${
                transactionType === "seller"
                  ? "border-blue-400 bg-blue-500/10 dark:border-blue-600 dark:bg-blue-900/30"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg text-center hover:bg-blue-500/10 dark:hover:bg-blue-900/20 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onClick={() => setTransactionType("seller")}
            >
              <span className="material-icons mb-1">sell</span>
              <p className="text-sm font-medium">Seller</p>
            </button>
          </ButtonGroup>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Website Design Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <Input placeholder="0.00" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="receiverEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{transactionType === "buyer" ? "Seller Email" : "Buyer Email"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">mail</span>
                  <Input placeholder="Email address" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date (optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the transaction details..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
