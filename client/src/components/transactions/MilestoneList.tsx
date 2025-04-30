import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Transaction, Milestone } from "@shared/schema";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { CheckCircle, Circle, PlusCircle, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

type MilestoneListProps = {
  transaction: Transaction;
  onUpdateMilestone: (updatedTransaction: Transaction) => void;
};

export function MilestoneList({ transaction, onUpdateMilestone }: MilestoneListProps) {
  const { toast } = useToast();
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: "",
    description: "",
    amount: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const milestones = transaction.milestones || [];
  
  const updateMilestonesMutation = useMutation({
    mutationFn: async (updatedMilestones: Milestone[]) => {
      const res = await apiRequest("PATCH", `/api/transactions/${transaction.id}`, {
        milestones: updatedMilestones,
        progress: calculateProgress(updatedMilestones),
      });
      return await res.json();
    },
    onSuccess: (updatedTransaction: Transaction) => {
      toast({
        title: "Milestones updated",
        description: "The milestones have been updated successfully.",
      });
      onUpdateMilestone(updatedTransaction);
      setShowAddForm(false);
      setNewMilestone({
        title: "",
        description: "",
        amount: 0,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update milestones",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const calculateProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    
    const completedCount = milestones.filter(m => m.isCompleted).length;
    return Math.round((completedCount / milestones.length) * 100);
  };
  
  const handleToggleMilestone = (milestoneId: string, completed: boolean) => {
    const updatedMilestones = milestones.map(milestone => 
      milestone.id === milestoneId
        ? { ...milestone, isCompleted: completed }
        : milestone
    );
    
    updateMilestonesMutation.mutate(updatedMilestones);
  };
  
  const handleAddMilestone = () => {
    if (!newMilestone.title || Number(newMilestone.amount) <= 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const milestone: Milestone = {
      id: uuidv4(),
      title: newMilestone.title,
      description: newMilestone.description || "",
      amount: Number(newMilestone.amount),
      isCompleted: false,
      dueDate: newMilestone.dueDate,
    };
    
    const updatedMilestones = [...milestones, milestone];
    updateMilestonesMutation.mutate(updatedMilestones);
  };
  
  return (
    <GlassmorphicCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Milestones</h3>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={transaction.status !== "in_progress"}
        >
          <PlusCircle className="h-4 w-4" />
          {showAddForm ? "Cancel" : "Add Milestone"}
        </Button>
      </div>
      
      {showAddForm && (
        <div className="mb-8 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800/50">
          <h4 className="text-lg font-medium mb-4">Add New Milestone</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title*</label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                placeholder="Milestone title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                placeholder="Describe this milestone"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount*</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    className="pl-8"
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone({...newMilestone, amount: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newMilestone.dueDate ? format(new Date(newMilestone.dueDate), "yyyy-MM-dd") : ""}
                  onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value ? new Date(e.target.value) : undefined})}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddMilestone}
                className="btn-primary"
                disabled={updateMilestonesMutation.isPending}
              >
                {updateMilestonesMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  "Add Milestone"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {milestones.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
          <h4 className="font-medium mb-2">No Milestones</h4>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Break down your transaction into manageable milestones to track progress.
          </p>
          {transaction.status === "in_progress" && !showAddForm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add First Milestone
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`p-4 border ${milestone.isCompleted ? 'border-success/30 bg-success/5' : 'border-neutral-200 dark:border-neutral-700'} rounded-lg`}
            >
              <div className="flex items-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`mr-2 mt-0.5 ${milestone.isCompleted ? 'text-success' : 'text-neutral-400'}`}
                  onClick={() => handleToggleMilestone(milestone.id, !milestone.isCompleted)}
                  disabled={updateMilestonesMutation.isPending || transaction.status !== "in_progress"}
                >
                  {milestone.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${milestone.isCompleted ? 'line-through text-neutral-500' : ''}`}>
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        ${milestone.amount.toFixed(2)}
                        {milestone.dueDate && ` • Due: ${format(new Date(milestone.dueDate), "MMM dd, yyyy")}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">
                        {milestone.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {milestone.description && (
                    <div className="mt-2 text-sm">
                      <p className={milestone.isCompleted ? 'text-neutral-500' : ''}>
                        {milestone.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              <span>Overall Progress</span>
              <span>{transaction.progress || 0}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-dark to-primary-light h-full rounded-full progress-bar" 
                style={{ width: `${transaction.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}
